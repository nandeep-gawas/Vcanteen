import express from 'express';
import db, { recordCoinTransaction } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get wallet balance and overview
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, roll_no, role, coin_balance FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Get lifetime delivery earnings for couriers
    const earnings = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total_earned,
             COUNT(*) as delivery_count
      FROM coin_transactions
      WHERE user_id = ? AND type = 'delivery_earnings'
    `).get(req.user.id);

    res.json({
      balance: user.coin_balance || 0,
      role: user.role,
      lifetimeEarned: earnings?.total_earned || 0,
      deliveriesCompleted: earnings?.delivery_count || 0
    });
  } catch (err) {
    console.error('Error fetching wallet:', err);
    res.status(500).json({ message: 'Failed to retrieve wallet information.' });
  }
});

// Get user's coin transaction history
router.get('/transactions', authenticateToken, (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT id, amount, type, reference_id, description, created_at
      FROM coin_transactions
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 50
    `).all(req.user.id);

    res.json({ transactions });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ message: 'Failed to retrieve transaction history.' });
  }
});

// Demo/Testing Top-up (Add allowance or recharge)
router.post('/topup', authenticateToken, (req, res) => {
  try {
    const { amount } = req.body;
    const addAmt = parseInt(amount, 10);
    if (isNaN(addAmt) || addAmt <= 0 || addAmt > 500) {
      return res.status(400).json({ message: 'Please provide a valid top-up amount between 1 and 500 coins.' });
    }

    const newBalance = recordCoinTransaction(
      req.user.id,
      addAmt,
      'topup',
      `TOPUP-${Date.now()}`,
      `Campus Card Allowance Recharge (+${addAmt} Coins)`
    );

    res.json({
      message: `Successfully topped up ${addAmt} Campus Coins!`,
      balance: newBalance
    });
  } catch (err) {
    console.error('Error topping up coins:', err);
    res.status(500).json({ message: 'Failed to top up coins.' });
  }
});

export default router;
