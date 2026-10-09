import express from 'express';
import db, { createNotification } from '../db/database.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// Standard available party time windows
export const STANDARD_PARTY_SLOTS = [
  '11:00 AM - 12:30 PM',
  '02:00 PM - 03:30 PM',
  '03:30 PM - 05:00 PM',
  '05:00 PM - 06:30 PM',
  '06:30 PM - 08:00 PM'
];

// Helper to generate unique booking number: PB-YYYY-XXX
function generateBookingNumber() {
  const year = new Date().getFullYear();
  const pattern = `PB-${year}-%`;
  const rows = db.prepare(`SELECT booking_number FROM party_bookings WHERE booking_number LIKE ?`).all(pattern);

  let maxSeq = 0;
  for (const row of rows) {
    if (row.booking_number) {
      const parts = row.booking_number.split('-');
      if (parts.length === 3) {
        const val = parseInt(parts[2], 10);
        if (!isNaN(val) && val > maxSeq) {
          maxSeq = val;
        }
      }
    }
  }

  return `PB-${year}-${String(maxSeq + 1).padStart(3, '0')}`;
}

// 1. Get Available Slots for a given Date (Prevents double booking)
router.get('/available-slots', authenticateToken, (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date parameter (YYYY-MM-DD) is required.' });
    }

    // Find taken slots on this date (Approved or Pending)
    const takenRows = db.prepare(`
      SELECT time_slot, status, event_type
      FROM party_bookings
      WHERE booking_date = ? AND status IN ('Approved', 'Pending')
    `).all(date);

    const takenSlotMap = {};
    for (const row of takenRows) {
      takenSlotMap[row.time_slot] = row.status;
    }

    const slots = STANDARD_PARTY_SLOTS.map((slot) => ({
      time_slot: slot,
      isBooked: !!takenSlotMap[slot],
      bookingStatus: takenSlotMap[slot] || null
    }));

    res.json({ date, slots });
  } catch (error) {
    console.error('Error checking slots:', error);
    res.status(500).json({ message: 'Failed to retrieve available slots.' });
  }
});

// 2. Submit Party / Birthday Pre-Booking Request (Student)
router.post('/bookings', authenticateToken, (req, res) => {
  try {
    const { event_type, booking_date, time_slot, guest_count, special_requests } = req.body;

    if (!event_type || !booking_date || !time_slot || !guest_count) {
      return res.status(400).json({ message: 'Event type, booking date, time slot, and guest count are required.' });
    }

    const guests = parseInt(guest_count, 10);
    if (!guests || guests < 5 || guests > 100) {
      return res.status(400).json({ message: 'Guest count must be between 5 and 100 people.' });
    }

    // Double Booking Prevention
    const existing = db.prepare(`
      SELECT id, booking_number, status, event_type FROM party_bookings
      WHERE booking_date = ? AND time_slot = ? AND status IN ('Approved', 'Pending')
    `).get(booking_date, time_slot);

    if (existing) {
      return res.status(409).json({
        message: `Double Booking Prevented! The time slot "${time_slot}" on ${booking_date} is already ${existing.status.toLowerCase()} for another event (${existing.event_type}). Please choose another slot or date.`
      });
    }

    const bookingNumber = generateBookingNumber();

    const stmt = db.prepare(`
      INSERT INTO party_bookings (
        booking_number, user_id, event_type, booking_date, time_slot,
        guest_count, special_requests, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
    `);

    const result = stmt.run(
      bookingNumber,
      req.user.id,
      event_type.trim(),
      booking_date.trim(),
      time_slot.trim(),
      guests,
      special_requests ? special_requests.trim() : null
    );

    res.status(201).json({
      message: 'Party pre-booking request submitted! College administration will review and confirm your reserved section.',
      bookingNumber,
      bookingId: result.lastInsertRowid,
      status: 'Pending'
    });
  } catch (error) {
    console.error('Error submitting party booking:', error);
    res.status(500).json({ message: 'Failed to submit party pre-booking.' });
  }
});

// 3. Student views their own party bookings
router.get('/bookings/my', authenticateToken, (req, res) => {
  try {
    const bookings = db.prepare(`
      SELECT pb.*, 
             admin.name as reviewer_name,
             admin.role as reviewer_role
      FROM party_bookings pb
      LEFT JOIN users admin ON pb.reviewed_by = admin.id
      WHERE pb.user_id = ?
      ORDER BY pb.id DESC
    `).all(req.user.id);

    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching my party bookings:', error);
    res.status(500).json({ message: 'Failed to retrieve bookings.' });
  }
});

// 4. Admin / Staff views all party booking requests
router.get('/bookings', authenticateToken, requireRoles('staff', 'admin'), (req, res) => {
  try {
    const { status, date } = req.query;

    let query = `
      SELECT pb.*,
             u.name as student_name, u.roll_no as student_roll, u.year as student_year, u.branch as student_branch,
             admin.name as reviewer_name
      FROM party_bookings pb
      JOIN users u ON pb.user_id = u.id
      LEFT JOIN users admin ON pb.reviewed_by = admin.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND pb.status = ?';
      params.push(status);
    }

    if (date) {
      query += ' AND pb.booking_date = ?';
      params.push(date);
    }

    query += ' ORDER BY pb.booking_date ASC, pb.id DESC';

    const bookings = db.prepare(query).all(...params);
    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching all party bookings:', error);
    res.status(500).json({ message: 'Failed to retrieve bookings list.' });
  }
});

// 5. Admin Approves or Rejects with a reason
router.patch('/bookings/:id/review', authenticateToken, requireRoles('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either "Approved" or "Rejected".' });
    }

    if (!admin_notes || !admin_notes.trim()) {
      return res.status(400).json({ message: 'Please provide an administrative reason or setup notes for the student.' });
    }

    const booking = db.prepare('SELECT id, user_id, booking_number, event_type, status, booking_date, time_slot FROM party_bookings WHERE id = ?').get(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking request not found.' });
    }

    // If approving, verify no other booking has been approved for the same slot
    if (status === 'Approved') {
      const conflict = db.prepare(`
        SELECT id, booking_number FROM party_bookings
        WHERE booking_date = ? AND time_slot = ? AND status = 'Approved' AND id != ?
      `).get(booking.booking_date, booking.time_slot, id);

      if (conflict) {
        return res.status(409).json({
          message: `Cannot approve! Slot "${booking.time_slot}" on ${booking.booking_date} is already approved for another party (${conflict.booking_number}).`
        });
      }
    }

    db.prepare(`
      UPDATE party_bookings
      SET status = ?, admin_notes = ?, reviewed_by = ?
      WHERE id = ?
    `).run(status, admin_notes.trim(), req.user.id, id);

    // Notify student of approval or rejection
    createNotification(
      booking.user_id,
      'booking',
      `Booking ${status}`,
      `Your party reservation (${booking.booking_number} - ${booking.event_type}) on ${booking.booking_date} was ${status.toLowerCase()}. Remarks: ${admin_notes.trim()}`,
      '/pre-booking'
    );

    res.json({
      message: `Party booking has been ${status.toLowerCase()}!`,
      status
    });
  } catch (error) {
    console.error('Error reviewing party booking:', error);
    res.status(500).json({ message: 'Failed to process booking review.' });
  }
});

export default router;
