import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate slot status against current local time
function getSlotStatus(startTime, endTime) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (currentMinutes < startMinutes) {
    const diff = startMinutes - currentMinutes;
    return {
      status: 'upcoming',
      minutesRemaining: diff,
      label: `Starts in ${Math.floor(diff / 60)}h ${diff % 60}m`
    };
  } else if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
    const diff = endMinutes - currentMinutes;
    return {
      status: 'active',
      minutesRemaining: diff,
      label: `Active Now! Ends in ${diff}m`
    };
  } else {
    return {
      status: 'ended',
      minutesRemaining: 0,
      label: 'Completed for Today'
    };
  }
}

// 1. Get all break slots (Accessible to all authenticated users)
router.get('/', authenticateToken, (req, res) => {
  try {
    const slots = db.prepare(`
      SELECT id, slot_name, target_year, start_time, end_time, max_capacity, current_capacity, is_active, created_at
      FROM break_slots
      ORDER BY 
        CASE WHEN target_year IS NULL THEN 99 ELSE target_year END ASC,
        start_time ASC
    `).all();

    // Attach real-time status to each slot
    const slotsWithStatus = slots.map(slot => ({
      ...slot,
      ...getSlotStatus(slot.start_time, slot.end_time)
    }));

    res.json({ slots: slotsWithStatus });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ message: 'Failed to fetch break slots.' });
  }
});

// 2. Get current student's own year slot with live countdown calculation
router.get('/my-slot', authenticateToken, (req, res) => {
  try {
    const user = req.user;
    if (!user.year) {
      return res.json({ slot: null, message: 'User does not have an assigned academic year.' });
    }

    const slot = db.prepare(`
      SELECT id, slot_name, target_year, start_time, end_time, max_capacity, is_active
      FROM break_slots
      WHERE target_year = ? AND is_active = 1
      LIMIT 1
    `).get(user.year);

    if (!slot) {
      return res.json({ slot: null, message: `No active break slot configured for Year ${user.year}.` });
    }

    const timing = getSlotStatus(slot.start_time, slot.end_time);

    // Compute exact seconds remaining for countdown
    const now = new Date();
    const [startH, startM] = slot.start_time.split(':').map(Number);
    const [endH, endM] = slot.end_time.split(':').map(Number);

    const startDate = new Date();
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date();
    endDate.setHours(endH, endM, 0, 0);

    let secondsToTarget = 0;
    if (timing.status === 'upcoming') {
      secondsToTarget = Math.max(0, Math.floor((startDate - now) / 1000));
    } else if (timing.status === 'active') {
      secondsToTarget = Math.max(0, Math.floor((endDate - now) / 1000));
    }

    res.json({
      slot: {
        ...slot,
        ...timing,
        secondsToTarget,
        currentTime: now.toLocaleTimeString()
      }
    });
  } catch (error) {
    console.error('Error fetching student slot:', error);
    res.status(500).json({ message: 'Failed to fetch student break slot.' });
  }
});

// 3. Create a new break slot (Admin only)
router.post('/', authenticateToken, requireRoles('admin'), (req, res) => {
  try {
    const { slot_name, target_year, start_time, end_time, max_capacity } = req.body;

    if (!slot_name || !start_time || !end_time) {
      return res.status(400).json({ message: 'Slot name, start time, and end time are required.' });
    }

    const yearVal = target_year ? parseInt(target_year, 10) : null;
    const capVal = max_capacity ? parseInt(max_capacity, 10) : 100;

    const stmt = db.prepare(`
      INSERT INTO break_slots (slot_name, target_year, start_time, end_time, max_capacity, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    const result = stmt.run(slot_name.trim(), yearVal, start_time.trim(), end_time.trim(), capVal);

    res.status(201).json({
      message: 'Break slot created successfully!',
      slotId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating slot:', error);
    res.status(500).json({ message: 'Failed to create break slot.' });
  }
});

// 4. Update an existing break slot (Admin only)
router.put('/:id', authenticateToken, requireRoles('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { slot_name, target_year, start_time, end_time, max_capacity, is_active } = req.body;

    const existing = db.prepare('SELECT id FROM break_slots WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ message: 'Break slot not found.' });
    }

    const yearVal = target_year !== undefined && target_year !== '' ? parseInt(target_year, 10) : null;
    const capVal = max_capacity ? parseInt(max_capacity, 10) : 100;
    const activeVal = is_active !== undefined ? (is_active ? 1 : 0) : 1;

    db.prepare(`
      UPDATE break_slots
      SET slot_name = ?, target_year = ?, start_time = ?, end_time = ?, max_capacity = ?, is_active = ?
      WHERE id = ?
    `).run(slot_name.trim(), yearVal, start_time.trim(), end_time.trim(), capVal, activeVal, id);

    res.json({ message: 'Break slot updated successfully!' });
  } catch (error) {
    console.error('Error updating slot:', error);
    res.status(500).json({ message: 'Failed to update break slot.' });
  }
});

// 5. Delete a break slot (Admin only)
router.delete('/:id', authenticateToken, requireRoles('admin'), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM break_slots WHERE id = ?').run(id);
    res.json({ message: 'Break slot deleted.' });
  } catch (error) {
    console.error('Error deleting slot:', error);
    res.status(500).json({ message: 'Failed to delete break slot.' });
  }
});

export default router;
