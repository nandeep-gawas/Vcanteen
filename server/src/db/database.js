import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../vcanteen.db');
const db = new Database(dbPath);

// Enable WAL mode & foreign keys for high performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Check if delivery_orders needs recreation for OTP support
  try {
    const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='delivery_orders'").get();
    if (tableInfo && !tableInfo.sql.includes('delivery_otp')) {
      db.exec('DROP TABLE IF EXISTS delivery_orders;');
    }
  } catch (e) {
    // Ignore
  }

  db.exec(`
    -- 1. Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      roll_no TEXT NOT NULL UNIQUE,
      year INTEGER CHECK(year BETWEEN 1 AND 4 OR year IS NULL),
      branch TEXT,
      role TEXT NOT NULL CHECK(role IN ('student', 'volunteer', 'staff', 'admin')),
      password_hash TEXT NOT NULL,
      coin_balance INTEGER NOT NULL DEFAULT 50,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Break Slots table
    CREATE TABLE IF NOT EXISTS break_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_name TEXT NOT NULL,
      target_year INTEGER CHECK(target_year BETWEEN 1 AND 4 OR target_year IS NULL),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      max_capacity INTEGER NOT NULL DEFAULT 100,
      current_capacity INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Canteen Settings table
    CREATE TABLE IF NOT EXISTS canteen_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- 4. Menu Items table (Feature 1: Classroom Delivery)
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      image_url TEXT,
      description TEXT,
      is_available INTEGER NOT NULL DEFAULT 1,
      preparation_time INTEGER DEFAULT 15,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Delivery Orders table (Classroom Delivery, Fees & OTP)
    CREATE TABLE IF NOT EXISTS delivery_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      volunteer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      classroom_location TEXT NOT NULL,
      student_year INTEGER,
      items_json TEXT NOT NULL,
      items_summary TEXT NOT NULL,
      subtotal REAL NOT NULL DEFAULT 0,
      delivery_fee REAL NOT NULL DEFAULT 10,
      surge_fee REAL NOT NULL DEFAULT 0,
      rain_fee REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      courier_reward_coins INTEGER NOT NULL DEFAULT 15,
      paid_with_coins INTEGER NOT NULL DEFAULT 0,
      delivery_otp TEXT NOT NULL,
      otp_used INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Placed' CHECK(status IN ('Placed', 'Accepted', 'Out for delivery', 'Delivered', 'Cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      delivered_at DATETIME
    );

    -- 6. Party / Birthday Pre-Bookings table (Feature 2: Party Pre-Booking)
    CREATE TABLE IF NOT EXISTS party_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      booking_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      guest_count INTEGER NOT NULL,
      special_requests TEXT,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Cancelled')),
      admin_notes TEXT,
      reviewed_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 7. Turnstile Entry Logs table
    CREATE TABLE IF NOT EXISTS entry_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      entry_type TEXT NOT NULL CHECK(entry_type IN ('in', 'out')),
      scanned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      notes TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. Complaints table
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Food Quality', 'Hygiene', 'Staff', 'Pricing', 'Other')),
      status TEXT NOT NULL DEFAULT 'Open' CHECK(status IN ('Open', 'Assigned', 'In Progress', 'Resolved')),
      assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
      resolution_notes TEXT,
      media_url TEXT,
      media_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 9. Complaint Remarks & Status History table
    CREATE TABLE IF NOT EXISTS complaint_remarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      from_status TEXT,
      to_status TEXT NOT NULL,
      remarks TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 10. Reviews table
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      food_taste INTEGER NOT NULL CHECK(food_taste BETWEEN 1 AND 5),
      hygiene INTEGER NOT NULL CHECK(hygiene BETWEEN 1 AND 5),
      cleanliness INTEGER NOT NULL CHECK(cleanliness BETWEEN 1 AND 5),
      staff_behaviour INTEGER NOT NULL CHECK(staff_behaviour BETWEEN 1 AND 5),
      overall_rating REAL NOT NULL,
      comment TEXT,
      food_item TEXT,
      chef_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 11. Suggestions table
    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Menu Upgrades', 'Chef Feedback', 'New Item Request', 'Other')),
      upvotes INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Submitted' CHECK(status IN ('Submitted', 'Under Review', 'Planned', 'Implemented')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 12. Suggestion Upvotes table
    CREATE TABLE IF NOT EXISTS suggestion_upvotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      suggestion_id INTEGER NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(suggestion_id, user_id)
    );

    -- 13. In-App Notifications table
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('complaint', 'order', 'booking', 'break', 'system')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 14. Campus Coin Transactions (Digital Currency Ledger)
    CREATE TABLE IF NOT EXISTS coin_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('delivery_earnings', 'payment', 'bonus', 'topup', 'admin_adjustment')),
      reference_id TEXT,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate existing tables if missing new columns
  try {
    const userCols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
    if (!userCols.includes('coin_balance')) {
      db.exec("ALTER TABLE users ADD COLUMN coin_balance INTEGER NOT NULL DEFAULT 50;");
    }
  } catch (e) {
    console.error('Migration error on users table:', e);
  }

  try {
    const orderCols = db.prepare("PRAGMA table_info(delivery_orders)").all().map(c => c.name);
    if (!orderCols.includes('subtotal')) {
      db.exec("ALTER TABLE delivery_orders ADD COLUMN subtotal REAL NOT NULL DEFAULT 0;");
    }
    if (!orderCols.includes('delivery_fee')) {
      db.exec("ALTER TABLE delivery_orders ADD COLUMN delivery_fee REAL NOT NULL DEFAULT 10;");
    }
    if (!orderCols.includes('surge_fee')) {
      db.exec("ALTER TABLE delivery_orders ADD COLUMN surge_fee REAL NOT NULL DEFAULT 0;");
    }
    if (!orderCols.includes('rain_fee')) {
      db.exec("ALTER TABLE delivery_orders ADD COLUMN rain_fee REAL NOT NULL DEFAULT 0;");
    }
    if (!orderCols.includes('courier_reward_coins')) {
      db.exec("ALTER TABLE delivery_orders ADD COLUMN courier_reward_coins INTEGER NOT NULL DEFAULT 15;");
    }
    if (!orderCols.includes('paid_with_coins')) {
      db.exec("ALTER TABLE delivery_orders ADD COLUMN paid_with_coins INTEGER NOT NULL DEFAULT 0;");
    }
  } catch (e) {
    console.error('Migration error on delivery_orders table:', e);
  }

  // Indexes for high performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_roll ON users(roll_no);
    CREATE INDEX IF NOT EXISTS idx_delivery_status ON delivery_orders(status);
    CREATE INDEX IF NOT EXISTS idx_delivery_user ON delivery_orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_delivery_volunteer ON delivery_orders(volunteer_id);
    CREATE INDEX IF NOT EXISTS idx_party_date_slot ON party_bookings(booking_date, time_slot);
    CREATE INDEX IF NOT EXISTS idx_party_status ON party_bookings(status);
    CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON coin_transactions(user_id);
  `);

  // Default canteen settings
  const defaultSettings = [
    { key: 'max_capacity', value: '100' },
    { key: 'base_delivery_fee', value: '10' },
    { key: 'surge_fee', value: '15' },
    { key: 'surge_active', value: '0' },
    { key: 'rain_fee', value: '15' },
    { key: 'rain_active', value: '0' }
  ];

  const getSettingStmt = db.prepare("SELECT value FROM canteen_settings WHERE key = ?");
  const insertSettingStmt = db.prepare("INSERT INTO canteen_settings (key, value) VALUES (?, ?)");

  for (const s of defaultSettings) {
    if (!getSettingStmt.get(s.key)) {
      insertSettingStmt.run(s.key, s.value);
    }
  }
}

// Helper to record a coin transaction and update user balance atomically
export function recordCoinTransaction(userId, amount, type, referenceId, description) {
  try {
    const user = db.prepare('SELECT coin_balance FROM users WHERE id = ?').get(userId);
    if (!user) return null;

    const newBalance = Math.max(0, (user.coin_balance || 0) + amount);

    const updateStmt = db.prepare('UPDATE users SET coin_balance = ? WHERE id = ?');
    const insertStmt = db.prepare(`
      INSERT INTO coin_transactions (user_id, amount, type, reference_id, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
      updateStmt.run(newBalance, userId);
      insertStmt.run(userId, amount, type, referenceId, description);
    })();

    return newBalance;
  } catch (err) {
    console.error('Failed to record coin transaction:', err);
    return null;
  }
}

// Helper to dispatch in-app notifications
export function createNotification(userId, type, title, message, link = '') {
  try {
    const stmt = db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, link, is_read)
      VALUES (?, ?, ?, ?, ?, 0)
    `);
    const res = stmt.run(userId, type, title, message, link);
    return res.lastInsertRowid;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
}

initDatabase();

export default db;
