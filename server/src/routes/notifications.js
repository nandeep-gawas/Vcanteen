import express from 'express';
import db, { createNotification } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to check and trigger "Your break starts in 5 minutes" notification
function checkBreakNotification(user) {
  if (user.role !== 'student' || !user.year) return;

  try {
    const slot = db.prepare(`
      SELECT * FROM break_slots 
      WHERE target_year = ? AND is_active = 1 
      ORDER BY id ASC LIMIT 1
    `).get(user.year);

    if (!slot) return;

    // Parse start_time (format HH:MM or HH:MM:SS)
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMin = currentHours * 60 + currentMinutes;

    const [startH, startM] = slot.start_time.split(':').map(Number);
    const slotStartTotalMin = startH * 60 + startM;

    const diffMin = slotStartTotalMin - currentTotalMin;

    // Trigger if within 10 minutes of start or just starting (0 to 10 min window)
    if (diffMin >= 0 && diffMin <= 10) {
      // Check if notification already sent in last 2 hours
      const existing = db.prepare(`
        SELECT id FROM notifications 
        WHERE user_id = ? AND type = 'break' AND datetime(created_at, '+2 hours') > datetime('now')
        LIMIT 1
      `).get(user.id);

      if (!existing) {
        createNotification(
          user.id,
          'break',
          'Break Starting Soon!',
          `Your Year ${user.year} lunch break starts at ${slot.start_time} (in ~${diffMin} mins). Head over now to avoid the rush!`,
          '/break-slots'
        );
      }
    }
  } catch (err) {
    console.error('Error checking break notification:', err);
  }
}

// 1. Get all notifications for current user
router.get('/', authenticateToken, (req, res) => {
  try {
    // Check if break reminder should be generated
    checkBreakNotification(req.user);

    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 40
    `).all(req.user.id);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `).get(req.user.id).count;

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
});

// 2. Mark single notification as read
router.patch('/:id/read', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE id = ? AND user_id = ?
    `).run(id, req.user.id);

    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ message: 'Failed to update notification.' });
  }
});

// 3. Mark all notifications as read
router.post('/mark-all-read', authenticateToken, (req, res) => {
  try {
    db.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE user_id = ?
    `).run(req.user.id);

    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    res.status(500).json({ message: 'Failed to update notifications.' });
  }
});

export default router;
