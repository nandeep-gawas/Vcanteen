import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'vcanteen_super_secret_jwt_key_2026';

// Register a new user
router.post('/register', (req, res) => {
  try {
    const { name, roll_no, year, branch, role, password } = req.body;

    if (!name || !roll_no || !password || !role) {
      return res.status(400).json({ message: 'Name, roll number, role, and password are required.' });
    }

    const validRoles = ['student', 'volunteer', 'staff', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Role must be one of: ${validRoles.join(', ')}` });
    }

    const cleanRoll = roll_no.trim().toLowerCase();

    // Check if roll_no exists
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(roll_no) = ?').get(cleanRoll);
    if (existing) {
      return res.status(409).json({ message: 'A user with this Roll Number or User ID already exists.' });
    }

    // Validate year if provided
    const parsedYear = year ? parseInt(year, 10) : null;
    if (parsedYear && (parsedYear < 1 || parsedYear > 4)) {
      return res.status(400).json({ message: 'Year must be between 1 and 4.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const insertStmt = db.prepare(`
      INSERT INTO users (name, roll_no, year, branch, role, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(name.trim(), cleanRoll, parsedYear, branch || null, role, passwordHash);

    const user = {
      id: result.lastInsertRowid,
      name: name.trim(),
      roll_no: cleanRoll,
      year: parsedYear,
      branch: branch || null,
      role,
      coin_balance: 50
    };

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error while registering user.' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { roll_no, password } = req.body;

    if (!roll_no || !password) {
      return res.status(400).json({ message: 'Please provide roll number / user ID and password.' });
    }

    const cleanRoll = roll_no.trim().toLowerCase();

    const user = db.prepare(`
      SELECT id, name, roll_no, year, branch, role, coin_balance, password_hash, created_at
      FROM users
      WHERE LOWER(roll_no) = ?
    `).get(cleanRoll);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const safeUser = {
      id: user.id,
      name: user.name,
      roll_no: user.roll_no,
      year: user.year,
      branch: user.branch,
      role: user.role,
      coin_balance: user.coin_balance ?? 50,
      created_at: user.created_at
    };

    res.json({
      message: 'Login successful!',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error while authenticating.' });
  }
});

// Get Current Logged-in User Profile
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
