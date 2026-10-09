import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db, { createNotification } from '../db/database.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'ticket-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 } // 30 MB for photo/video/screenshot
});

// Helper to generate ticket number VC-YYYY-XXXX
function generateTicketNumber() {
  const year = new Date().getFullYear();
  const pattern = `VC-${year}-%`;
  const lastRow = db.prepare(`
    SELECT ticket_number FROM complaints
    WHERE ticket_number LIKE ?
    ORDER BY id DESC LIMIT 1
  `).get(pattern);

  let nextSeq = 1;
  if (lastRow && lastRow.ticket_number) {
    const parts = lastRow.ticket_number.split('-');
    if (parts.length === 3) {
      nextSeq = parseInt(parts[2], 10) + 1;
    }
  }

  return `VC-${year}-${String(nextSeq).padStart(4, '0')}`;
}

// 1. Submit a New Complaint (Student & all users) with Multer upload
router.post('/', authenticateToken, upload.single('media'), (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required.' });
    }

    const validCategories = ['Food Quality', 'Hygiene', 'Staff', 'Pricing', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: `Category must be one of: ${validCategories.join(', ')}` });
    }

    const ticketNumber = generateTicketNumber();
    let mediaUrl = null;
    let mediaType = null;

    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    const insertStmt = db.prepare(`
      INSERT INTO complaints (ticket_number, user_id, title, description, category, status, media_url, media_type)
      VALUES (?, ?, ?, ?, ?, 'Open', ?, ?)
    `);

    const result = insertStmt.run(ticketNumber, req.user.id, title.trim(), description.trim(), category, mediaUrl, mediaType);
    const complaintId = result.lastInsertRowid;

    // Log initial timeline remark
    db.prepare(`
      INSERT INTO complaint_remarks (complaint_id, user_id, from_status, to_status, remarks)
      VALUES (?, ?, NULL, 'Open', 'Ticket created by student.')
    `).run(complaintId, req.user.id);

    res.status(201).json({
      message: 'Complaint submitted successfully!',
      ticketNumber,
      complaintId
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ message: 'Failed to submit complaint.' });
  }
});

// 2. Get My Complaints (Student View with ticket tracker timeline)
router.get('/my', authenticateToken, (req, res) => {
  try {
    const { search, status, category } = req.query;

    let query = `
      SELECT c.*, 
             staff.name as assigned_to_name,
             staff.roll_no as assigned_to_roll
      FROM complaints c
      LEFT JOIN users staff ON c.assigned_to = staff.id
      WHERE c.user_id = ?
    `;
    const params = [req.user.id];

    if (status && status !== 'all') {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (category && category !== 'all') {
      query += ' AND c.category = ?';
      params.push(category);
    }

    if (search && search.trim()) {
      query += ' AND (c.ticket_number LIKE ? OR c.title LIKE ? OR c.description LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY c.id DESC';

    const complaints = db.prepare(query).all(...params);

    // Attach remarks timeline to each complaint
    const getRemarks = db.prepare(`
      SELECT r.*, u.name as author_name, u.role as author_role
      FROM complaint_remarks r
      JOIN users u ON r.user_id = u.id
      WHERE r.complaint_id = ?
      ORDER BY r.id ASC
    `);

    const enriched = complaints.map(c => ({
      ...c,
      timeline: getRemarks.all(c.id)
    }));

    res.json({ complaints: enriched });
  } catch (error) {
    console.error('Error fetching my complaints:', error);
    res.status(500).json({ message: 'Failed to fetch complaints.' });
  }
});

// 3. Get All Complaints (Admin / Staff View with filters & search)
router.get('/', authenticateToken, requireRoles('staff', 'admin'), (req, res) => {
  try {
    const { search, status, category, assigned_to } = req.query;

    let query = `
      SELECT c.*, 
             u.name as student_name, u.roll_no as student_roll, u.year as student_year, u.branch as student_branch,
             staff.name as assigned_to_name, staff.roll_no as assigned_to_roll
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN users staff ON c.assigned_to = staff.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (category && category !== 'all') {
      query += ' AND c.category = ?';
      params.push(category);
    }

    if (assigned_to && assigned_to !== 'all') {
      if (assigned_to === 'unassigned') {
        query += ' AND c.assigned_to IS NULL';
      } else {
        query += ' AND c.assigned_to = ?';
        params.push(assigned_to);
      }
    }

    if (search && search.trim()) {
      query += ' AND (c.ticket_number LIKE ? OR c.title LIKE ? OR u.name LIKE ? OR u.roll_no LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY c.id DESC';

    const complaints = db.prepare(query).all(...params);

    const getRemarks = db.prepare(`
      SELECT r.*, u.name as author_name, u.role as author_role
      FROM complaint_remarks r
      JOIN users u ON r.user_id = u.id
      WHERE r.complaint_id = ?
      ORDER BY r.id ASC
    `);

    const enriched = complaints.map(c => ({
      ...c,
      timeline: getRemarks.all(c.id)
    }));

    res.json({ complaints: enriched });
  } catch (error) {
    console.error('Error fetching all complaints:', error);
    res.status(500).json({ message: 'Failed to fetch complaints list.' });
  }
});

// 4. Assign Complaint to Staff Member
router.patch('/:id/assign', authenticateToken, requireRoles('staff', 'admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { staff_id, remarks } = req.body;

    const complaint = db.prepare('SELECT id, user_id, ticket_number, status FROM complaints WHERE id = ?').get(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    const staffMember = db.prepare('SELECT id, name FROM users WHERE id = ? AND role IN (\'staff\', \'admin\')').get(staff_id);
    if (!staffMember) {
      return res.status(400).json({ message: 'Selected staff member does not exist.' });
    }

    const newStatus = complaint.status === 'Open' ? 'Assigned' : complaint.status;

    db.prepare(`
      UPDATE complaints
      SET assigned_to = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(staff_id, newStatus, id);

    const remarkText = remarks && remarks.trim()
      ? `Assigned to ${staffMember.name}: ${remarks.trim()}`
      : `Ticket assigned to ${staffMember.name}.`;

    db.prepare(`
      INSERT INTO complaint_remarks (complaint_id, user_id, from_status, to_status, remarks)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user.id, complaint.status, newStatus, remarkText);

    // Notify student of assignment
    createNotification(
      complaint.user_id,
      'complaint',
      'Complaint Assigned to Staff',
      `Ticket #${complaint.ticket_number} has been assigned to ${staffMember.name} for resolution.`,
      '/complaints'
    );

    res.json({
      message: `Assigned successfully to ${staffMember.name}`,
      status: newStatus
    });
  } catch (error) {
    console.error('Error assigning complaint:', error);
    res.status(500).json({ message: 'Failed to assign complaint.' });
  }
});

// 5. Update Status Flow (Open -> Assigned -> In Progress -> Resolved) with Staff Remarks
router.patch('/:id/status', authenticateToken, requireRoles('staff', 'admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ['Open', 'Assigned', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({ message: 'Staff remarks are required when updating ticket status.' });
    }

    const complaint = db.prepare('SELECT id, user_id, ticket_number, status, resolution_notes FROM complaints WHERE id = ?').get(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    db.prepare(`
      UPDATE complaints
      SET status = ?, resolution_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, remarks.trim(), id);

    db.prepare(`
      INSERT INTO complaint_remarks (complaint_id, user_id, from_status, to_status, remarks)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user.id, complaint.status, status, remarks.trim());

    // Dispatch notification to the student
    createNotification(
      complaint.user_id,
      'complaint',
      `Complaint ${status}`,
      `Your ticket #${complaint.ticket_number} was updated to "${status}". Remarks: ${remarks.trim()}`,
      '/complaints'
    );

    res.json({
      message: `Status updated to "${status}" successfully.`,
      status
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Failed to update complaint status.' });
  }
});

// 6. Get Staff List (for assignment dropdown)
router.get('/staff-list', authenticateToken, (req, res) => {
  try {
    const staffList = db.prepare(`
      SELECT id, name, roll_no, branch, role
      FROM users
      WHERE role IN ('staff', 'admin')
      ORDER BY name ASC
    `).all();

    res.json({ staff: staffList });
  } catch (error) {
    console.error('Error fetching staff list:', error);
    res.status(500).json({ message: 'Failed to load staff list.' });
  }
});

export default router;
