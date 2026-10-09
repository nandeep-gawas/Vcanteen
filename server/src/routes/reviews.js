import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// 1. REVIEWS SECTION
// ==========================================

// Submit a multi-category review
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      food_taste,
      hygiene,
      cleanliness,
      staff_behaviour,
      comment,
      food_item,
      chef_name
    } = req.body;

    const taste = parseInt(food_taste, 10);
    const hyg = parseInt(hygiene, 10);
    const clean = parseInt(cleanliness, 10);
    const staff = parseInt(staff_behaviour, 10);

    if (!taste || !hyg || !clean || !staff) {
      return res.status(400).json({ message: 'Ratings (1-5 stars) required for all 4 categories: Food Taste, Hygiene, Cleanliness, Staff Behaviour.' });
    }

    const ratings = [taste, hyg, clean, staff];
    if (ratings.some(r => r < 1 || r > 5)) {
      return res.status(400).json({ message: 'All ratings must be between 1 and 5 stars.' });
    }

    const overallRating = Math.round(((taste + hyg + clean + staff) / 4) * 10) / 10;

    const stmt = db.prepare(`
      INSERT INTO reviews (user_id, food_taste, hygiene, cleanliness, staff_behaviour, overall_rating, comment, food_item, chef_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      req.user.id,
      taste,
      hyg,
      clean,
      staff,
      overallRating,
      comment ? comment.trim() : null,
      food_item ? food_item.trim() : null,
      chef_name ? chef_name.trim() : null
    );

    res.status(201).json({
      message: 'Review submitted successfully! Thank you for helping improve VCanteen.',
      reviewId: result.lastInsertRowid,
      overallRating
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Failed to submit review.' });
  }
});

// Get recent reviews
router.get('/', authenticateToken, (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT r.*, u.name as reviewer_name, u.roll_no as reviewer_roll, u.year as reviewer_year, u.branch as reviewer_branch
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.id DESC
      LIMIT 30
    `).all();

    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to retrieve reviews.' });
  }
});

// Admin Analytics for Recharts
router.get('/analytics', authenticateToken, (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_reviews,
        ROUND(AVG(food_taste), 2) as avg_food_taste,
        ROUND(AVG(hygiene), 2) as avg_hygiene,
        ROUND(AVG(cleanliness), 2) as avg_cleanliness,
        ROUND(AVG(staff_behaviour), 2) as avg_staff_behaviour,
        ROUND(AVG(overall_rating), 2) as avg_overall
      FROM reviews
    `).get();

    // Chart-ready category array for Recharts
    const chartData = [
      { category: 'Food Taste', rating: stats.avg_food_taste || 4.2, fullMark: 5, fill: '#F97316' },
      { category: 'Hygiene', rating: stats.avg_hygiene || 4.4, fullMark: 5, fill: '#10B981' },
      { category: 'Cleanliness', rating: stats.avg_cleanliness || 4.3, fullMark: 5, fill: '#3B82F6' },
      { category: 'Staff Behaviour', rating: stats.avg_staff_behaviour || 4.1, fullMark: 5, fill: '#8B5CF6' }
    ];

    // Top dishes mentioned
    const topDishes = db.prepare(`
      SELECT food_item, COUNT(*) as count, ROUND(AVG(food_taste), 1) as avg_taste
      FROM reviews
      WHERE food_item IS NOT NULL AND food_item != ''
      GROUP BY food_item
      ORDER BY count DESC
      LIMIT 5
    `).all();

    res.json({
      summary: stats,
      chartData,
      topDishes
    });
  } catch (error) {
    console.error('Error fetching review analytics:', error);
    res.status(500).json({ message: 'Failed to retrieve review analytics.' });
  }
});

// ==========================================
// 2. SUGGESTIONS SECTION
// ==========================================

// Submit a suggestion
router.post('/suggestions', authenticateToken, (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required.' });
    }

    const validCats = ['Menu Upgrades', 'Chef Feedback', 'New Item Request', 'Other'];
    if (!validCats.includes(category)) {
      return res.status(400).json({ message: `Category must be one of: ${validCats.join(', ')}` });
    }

    const stmt = db.prepare(`
      INSERT INTO suggestions (user_id, title, description, category, upvotes, status)
      VALUES (?, ?, ?, ?, 1, 'Submitted')
    `);

    const result = stmt.run(req.user.id, title.trim(), description.trim(), category);
    const suggestionId = result.lastInsertRowid;

    // Auto-upvote by author
    db.prepare('INSERT INTO suggestion_upvotes (suggestion_id, user_id) VALUES (?, ?)').run(suggestionId, req.user.id);

    res.status(201).json({
      message: 'Suggestion submitted successfully!',
      suggestionId
    });
  } catch (error) {
    console.error('Error submitting suggestion:', error);
    res.status(500).json({ message: 'Failed to submit suggestion.' });
  }
});

// Get all suggestions with upvote indicator for current user
router.get('/suggestions', authenticateToken, (req, res) => {
  try {
    const { category, sort } = req.query;

    let query = `
      SELECT s.*, 
             u.name as author_name, u.roll_no as author_roll, u.branch as author_branch,
             CASE WHEN uv.id IS NOT NULL THEN 1 ELSE 0 END as has_upvoted
      FROM suggestions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN suggestion_upvotes uv ON s.id = uv.suggestion_id AND uv.user_id = ?
      WHERE 1=1
    `;
    const params = [req.user.id];

    if (category && category !== 'all') {
      query += ' AND s.category = ?';
      params.push(category);
    }

    if (sort === 'newest') {
      query += ' ORDER BY s.id DESC';
    } else {
      query += ' ORDER BY s.upvotes DESC, s.id DESC';
    }

    const suggestions = db.prepare(query).all(...params);

    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Failed to retrieve suggestions.' });
  }
});

// Upvote / Un-upvote a suggestion
router.post('/suggestions/:id/upvote', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = db.prepare('SELECT id FROM suggestion_upvotes WHERE suggestion_id = ? AND user_id = ?').get(id, userId);

    if (existing) {
      // Remove upvote
      db.prepare('DELETE FROM suggestion_upvotes WHERE id = ?').run(existing.id);
      db.prepare('UPDATE suggestions SET upvotes = MAX(0, upvotes - 1) WHERE id = ?').run(id);
    } else {
      // Add upvote
      db.prepare('INSERT INTO suggestion_upvotes (suggestion_id, user_id) VALUES (?, ?)').run(id, userId);
      db.prepare('UPDATE suggestions SET upvotes = upvotes + 1 WHERE id = ?').run(id);
    }

    const updated = db.prepare('SELECT upvotes FROM suggestions WHERE id = ?').get(id);

    res.json({
      hasUpvoted: !existing,
      upvotes: updated ? updated.upvotes : 0
    });
  } catch (error) {
    console.error('Error toggling upvote:', error);
    res.status(500).json({ message: 'Failed to register upvote.' });
  }
});

// Update suggestion status (Admin / Staff)
router.patch('/suggestions/:id/status', authenticateToken, requireRoles('staff', 'admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Submitted', 'Under Review', 'Planned', 'Implemented'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    db.prepare('UPDATE suggestions SET status = ? WHERE id = ?').run(status, id);

    res.json({ message: `Suggestion marked as "${status}".`, status });
  } catch (error) {
    console.error('Error updating suggestion status:', error);
    res.status(500).json({ message: 'Failed to update suggestion status.' });
  }
});

export default router;
