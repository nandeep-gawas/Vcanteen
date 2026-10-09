import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// Helper to count how many students are currently inside
export function getCurrentOccupancy() {
  const capRow = db.prepare("SELECT value FROM canteen_settings WHERE key = 'max_capacity'").get();
  const maxCapacity = capRow ? parseInt(capRow.value, 10) : 100;

  // Student is currently inside if their latest scan today is 'in'
  const query = `
    WITH latest_scans AS (
      SELECT user_id, entry_type,
             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY id DESC) as rn
      FROM entry_logs
      WHERE DATE(timestamp, 'localtime') = DATE('now', 'localtime')
    )
    SELECT COUNT(*) as count FROM latest_scans WHERE rn = 1 AND entry_type = 'in'
  `;

  const countRow = db.prepare(query).get();
  const currentInside = countRow ? countRow.count : 0;
  const occupancyRate = Math.min(100, Math.round((currentInside / (maxCapacity || 1)) * 100));

  let crowdLevel = 'low';
  if (occupancyRate >= 100) crowdLevel = 'full';
  else if (occupancyRate >= 80) crowdLevel = 'high';
  else if (occupancyRate >= 50) crowdLevel = 'moderate';

  return {
    currentInside,
    maxCapacity,
    occupancyRate,
    crowdLevel,
    isFull: currentInside >= maxCapacity
  };
}

// 1. Live Occupancy Meter (Polled every 5s by student dashboard and scanner)
router.get('/occupancy', (req, res) => {
  try {
    const occupancy = getCurrentOccupancy();
    res.json(occupancy);
  } catch (error) {
    console.error('Error getting occupancy:', error);
    res.status(500).json({ message: 'Failed to retrieve occupancy.' });
  }
});

// 2. Update Canteen Max Capacity (Admin only)
router.post('/capacity', authenticateToken, requireRoles('admin'), (req, res) => {
  try {
    const { maxCapacity } = req.body;
    const cap = parseInt(maxCapacity, 10);
    if (!cap || cap < 1) {
      return res.status(400).json({ message: 'Valid positive integer required for max capacity.' });
    }

    db.prepare(`
      INSERT INTO canteen_settings (key, value) VALUES ('max_capacity', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(cap.toString());

    res.json({ message: `Canteen max capacity updated to ${cap}.`, maxCapacity: cap });
  } catch (error) {
    console.error('Error updating capacity:', error);
    res.status(500).json({ message: 'Failed to update capacity setting.' });
  }
});

// 3. Scan Student QR Code (Staff & Admin)
router.post('/scan', authenticateToken, requireRoles('staff', 'admin'), (req, res) => {
  try {
    const { roll_no, override } = req.body;

    if (!roll_no) {
      return res.status(400).json({ message: 'Student Roll Number / QR code content is required.' });
    }

    const cleanRoll = roll_no.trim().toLowerCase();

    // Look up student
    const student = db.prepare(`
      SELECT id, name, roll_no, year, branch, role FROM users WHERE LOWER(roll_no) = ?
    `).get(cleanRoll);

    if (!student) {
      return res.status(404).json({
        success: false,
        code: 'STUDENT_NOT_FOUND',
        message: `Student with ID "${roll_no}" not registered in VCanteen database.`
      });
    }

    // Check student's latest scan today
    const latestLog = db.prepare(`
      SELECT entry_type FROM entry_logs
      WHERE user_id = ? AND DATE(timestamp, 'localtime') = DATE('now', 'localtime')
      ORDER BY id DESC LIMIT 1
    `).get(student.id);

    const isInside = latestLog && latestLog.entry_type === 'in';
    const nextAction = isInside ? 'out' : 'in';

    // Current occupancy
    const { currentInside, maxCapacity, isFull } = getCurrentOccupancy();

    // CASE 1: Student is exiting
    if (nextAction === 'out') {
      db.prepare(`
        INSERT INTO entry_logs (user_id, entry_type, scanned_by, notes)
        VALUES (?, 'out', ?, 'Regular Exit')
      `).run(student.id, req.user.id);

      const updated = getCurrentOccupancy();

      return res.json({
        success: true,
        action: 'EXIT',
        student,
        currentInside: updated.currentInside,
        maxCapacity: updated.maxCapacity,
        message: `Checkout successful for ${student.name}. Safe travels!`
      });
    }

    // CASE 2: Student is entering
    // A) Check Canteen Full Capacity
    if (isFull && !override) {
      return res.status(400).json({
        success: false,
        code: 'CANTEEN_FULL',
        title: 'CANTEEN FULL',
        message: `Canteen is at maximum capacity (${currentInside}/${maxCapacity} seats filled). Entry is blocked to prevent stampede.`,
        student,
        currentInside,
        maxCapacity,
        requiresOverride: true
      });
    }

    // B) Check Year-Wise Break Timing
    let overrideNote = isFull ? 'Staff Override: Canteen at Full Capacity' : null;

    if (student.year) {
      const slot = db.prepare(`
        SELECT slot_name, start_time, end_time FROM break_slots
        WHERE target_year = ? AND is_active = 1
        LIMIT 1
      `).get(student.year);

      if (slot) {
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();

        const [sH, sM] = slot.start_time.split(':').map(Number);
        const [eH, eM] = slot.end_time.split(':').map(Number);

        const startMins = sH * 60 + sM;
        const endMins = eH * 60 + eM;

        if (currentMins < startMins || currentMins > endMins) {
          if (!override) {
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            return res.status(400).json({
              success: false,
              code: 'OUTSIDE_SLOT',
              title: 'OUTSIDE ASSIGNED BREAK SLOT',
              message: `Student is in Year ${student.year}. Designated break slot is ${slot.start_time} - ${slot.end_time}. Current time is ${timeStr}.`,
              student,
              slot,
              requiresOverride: true
            });
          } else {
            overrideNote = overrideNote
              ? `${overrideNote} & Outside Year ${student.year} slot`
              : `Staff Override: Outside Year ${student.year} slot (${slot.start_time}-${slot.end_time})`;
          }
        }
      }
    }

    // Record Entry
    db.prepare(`
      INSERT INTO entry_logs (user_id, entry_type, scanned_by, notes)
      VALUES (?, 'in', ?, ?)
    `).run(student.id, req.user.id, overrideNote || 'Authorized Slot Entry');

    const updated = getCurrentOccupancy();

    return res.json({
      success: true,
      action: 'ENTRY',
      student,
      currentInside: updated.currentInside,
      maxCapacity: updated.maxCapacity,
      overrideUsed: !!overrideNote,
      message: overrideNote
        ? `Override Entry Granted for ${student.name} (${overrideNote}).`
        : `Entry Granted for ${student.name}. Welcome to VCanteen!`
    });
  } catch (error) {
    console.error('Error scanning QR:', error);
    res.status(500).json({ message: 'Internal error processing gate scan.' });
  }
});

// 4. Recent Entry/Exit Logs
router.get('/recent-logs', authenticateToken, requireRoles('staff', 'admin'), (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT l.id, l.entry_type, l.notes, l.timestamp,
             u.name as student_name, u.roll_no, u.year, u.branch,
             staff.name as scanned_by_name
      FROM entry_logs l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN users staff ON l.scanned_by = staff.id
      WHERE DATE(l.timestamp, 'localtime') = DATE('now', 'localtime')
      ORDER BY l.id DESC
      LIMIT 15
    `).all();

    res.json({ logs });
  } catch (error) {
    console.error('Error getting entry logs:', error);
    res.status(500).json({ message: 'Failed to retrieve logs.' });
  }
});

export default router;
