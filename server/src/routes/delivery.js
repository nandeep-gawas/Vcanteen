import express from 'express';
import db, { createNotification, recordCoinTransaction } from '../db/database.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// Helper to get delivery pricing configuration & active conditions
export function getDeliveryPricing() {
  const getVal = (key, fallback) => {
    const row = db.prepare('SELECT value FROM canteen_settings WHERE key = ?').get(key);
    return row ? row.value : fallback;
  };

  const baseDeliveryFee = parseFloat(getVal('base_delivery_fee', '10')) || 10;
  const surgeFee = parseFloat(getVal('surge_fee', '15')) || 15;
  const surgeActive = getVal('surge_active', '0') === '1';
  const rainFee = parseFloat(getVal('rain_fee', '15')) || 15;
  const rainActive = getVal('rain_active', '0') === '1';
  const courierBonusCoins = 5; // Campus courier reliability incentive

  return {
    baseDeliveryFee,
    surgeFee,
    isSurgeActive: surgeActive,
    rainFee,
    isRainActive: rainActive,
    courierBonusCoins,
    totalCourierReward: baseDeliveryFee + (surgeActive ? surgeFee : 0) + (rainActive ? rainFee : 0) + courierBonusCoins
  };
}

// Helper to generate unique order number: ORD-YYYY-XXXX
// Helper to generate unique order number: ORD-YYYY-XXXX
function generateOrderNumber() {
  const year = new Date().getFullYear();
  const pattern = `ORD-${year}-%`;
  const rows = db.prepare(`SELECT order_number FROM delivery_orders WHERE order_number LIKE ?`).all(pattern);

  let maxSeq = 100;
  for (const row of rows) {
    if (row.order_number) {
      const parts = row.order_number.split('-');
      if (parts.length === 3) {
        const val = parseInt(parts[2], 10);
        if (!isNaN(val) && val > maxSeq) {
          maxSeq = val;
        }
      }
    }
  }

  return `ORD-${year}-${maxSeq + 1}`;
}


// ==========================================
// 1. MENU MANAGEMENT
// ==========================================

// Get all menu items
router.get('/menu', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM menu_items ORDER BY is_available DESC, category ASC, name ASC').all();
    res.json({ menu: items });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ message: 'Failed to retrieve canteen menu.' });
  }
});

// Create new menu item (Staff & Admin)
router.post('/menu', authenticateToken, requireRoles('staff', 'admin'), (req, res) => {
  try {
    const { name, category, price, image_url, description, preparation_time } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Item name, category, and price are required.' });
    }

    const priceVal = parseFloat(price);
    const timeVal = preparation_time ? parseInt(preparation_time, 10) : 15;

    const stmt = db.prepare(`
      INSERT INTO menu_items (name, category, price, image_url, description, is_available, preparation_time)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `);

    const result = stmt.run(
      name.trim(),
      category.trim(),
      priceVal,
      image_url ? image_url.trim() : null,
      description ? description.trim() : null,
      timeVal
    );

    res.status(201).json({
      message: 'Menu item added successfully!',
      itemId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Failed to add menu item.' });
  }
});

// Update menu item (Staff & Admin)
router.put('/menu/:id', authenticateToken, requireRoles('staff', 'admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, image_url, description, is_available, preparation_time } = req.body;

    const existing = db.prepare('SELECT id FROM menu_items WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    const priceVal = parseFloat(price);
    const availVal = is_available !== undefined ? (is_available ? 1 : 0) : 1;
    const timeVal = preparation_time ? parseInt(preparation_time, 10) : 15;

    db.prepare(`
      UPDATE menu_items
      SET name = ?, category = ?, price = ?, image_url = ?, description = ?, is_available = ?, preparation_time = ?
      WHERE id = ?
    `).run(
      name.trim(),
      category.trim(),
      priceVal,
      image_url ? image_url.trim() : null,
      description ? description.trim() : null,
      availVal,
      timeVal,
      id
    );

    res.json({ message: 'Menu item updated successfully!' });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Failed to update menu item.' });
  }
});

// Delete menu item (Staff & Admin)
router.delete('/menu/:id', authenticateToken, requireRoles('staff', 'admin'), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
    res.json({ message: 'Menu item deleted.' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: 'Failed to delete menu item.' });
  }
});

// ==========================================
// 2. PRICING & FEE MANAGEMENT
// ==========================================

// Get current delivery fee structure & active weather/surge conditions
router.get('/pricing', (req, res) => {
  try {
    const pricing = getDeliveryPricing();
    res.json({
      ...pricing,
      explanation: 'All delivery charges (base courier fee, rush surge, and monsoon rain allowances) are credited directly to your peer student courier as Campus Coins.'
    });
  } catch (err) {
    console.error('Error fetching pricing:', err);
    res.status(500).json({ message: 'Failed to retrieve delivery pricing.' });
  }
});

// Staff / Admin toggle surge mode, rain mode, or adjust fee rates
router.post('/pricing/toggle', authenticateToken, requireRoles('staff', 'admin'), (req, res) => {
  try {
    const { rain_active, surge_active, base_delivery_fee, surge_fee, rain_fee } = req.body;

    const upsertStmt = db.prepare(`
      INSERT INTO canteen_settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    db.transaction(() => {
      if (rain_active !== undefined) {
        upsertStmt.run('rain_active', rain_active ? '1' : '0');
      }
      if (surge_active !== undefined) {
        upsertStmt.run('surge_active', surge_active ? '1' : '0');
      }
      if (base_delivery_fee !== undefined) {
        upsertStmt.run('base_delivery_fee', Math.max(0, parseFloat(base_delivery_fee)).toString());
      }
      if (surge_fee !== undefined) {
        upsertStmt.run('surge_fee', Math.max(0, parseFloat(surge_fee)).toString());
      }
      if (rain_fee !== undefined) {
        upsertStmt.run('rain_fee', Math.max(0, parseFloat(rain_fee)).toString());
      }
    })();

    const updatedPricing = getDeliveryPricing();
    res.json({
      message: 'Delivery fee settings updated successfully!',
      pricing: updatedPricing
    });
  } catch (err) {
    console.error('Error updating pricing:', err);
    res.status(500).json({ message: 'Failed to update delivery fee settings.' });
  }
});

// ==========================================
// 3. CLASSROOM ORDERING & DELIVERY
// ==========================================

// Student places a new classroom delivery order
router.post('/orders', authenticateToken, (req, res) => {
  try {
    const { classroom_location, student_year, items, pay_with_coins } = req.body;

    if (!classroom_location || !classroom_location.trim()) {
      return res.status(400).json({ message: 'Classroom / Room location is required (e.g. Lab 304, IT Block).' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty. Please add items to order.' });
    }

    // Compute subtotal & summary
    let subtotal = 0;
    const summaryParts = [];

    for (const it of items) {
      const q = it.quantity || 1;
      subtotal += (it.price * q);
      summaryParts.push(`${q}x ${it.name}`);
    }

    const itemsSummary = summaryParts.join(', ');
    const orderNumber = generateOrderNumber();

    // Fetch live pricing conditions
    const pricing = getDeliveryPricing();
    const deliveryFee = pricing.baseDeliveryFee;
    const surgeFee = pricing.isSurgeActive ? pricing.surgeFee : 0;
    const rainFee = pricing.isRainActive ? pricing.rainFee : 0;
    const totalAmount = subtotal + deliveryFee + surgeFee + rainFee;
    const courierRewardCoins = Math.round(deliveryFee + surgeFee + rainFee + pricing.courierBonusCoins);

    const useCoins = !!pay_with_coins;

    // Check coin balance if buyer wants to pay with Campus Coins
    if (useCoins) {
      const buyer = db.prepare('SELECT coin_balance FROM users WHERE id = ?').get(req.user.id);
      const buyerBalance = buyer?.coin_balance || 0;
      if (buyerBalance < totalAmount) {
        return res.status(400).json({
          message: `Insufficient Campus Coins! This order requires ${totalAmount} coins, but your balance is ${buyerBalance} coins. Please choose Cash / UPI or top up your coins.`
        });
      }
    }

    // Generate random 4-digit Delivery OTP (1000 - 9999)
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const insertStmt = db.prepare(`
      INSERT INTO delivery_orders (
        order_number, user_id, classroom_location, student_year,
        items_json, items_summary, subtotal, delivery_fee, surge_fee, rain_fee,
        total_amount, courier_reward_coins, paid_with_coins, delivery_otp, otp_used, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'Placed')
    `);

    const result = insertStmt.run(
      orderNumber,
      req.user.id,
      classroom_location.trim(),
      student_year ? parseInt(student_year, 10) : req.user.year,
      JSON.stringify(items),
      itemsSummary,
      subtotal,
      deliveryFee,
      surgeFee,
      rainFee,
      totalAmount,
      courierRewardCoins,
      useCoins ? 1 : 0,
      deliveryOtp
    );

    // Deduct buyer coins if paid with digital currency
    if (useCoins) {
      recordCoinTransaction(
        req.user.id,
        -totalAmount,
        'payment',
        orderNumber,
        `Payment for order #${orderNumber} (${itemsSummary})`
      );
    }

    res.status(201).json({
      message: 'Classroom order placed successfully!',
      orderNumber,
      orderId: result.lastInsertRowid,
      subtotal,
      deliveryFee,
      surgeFee,
      rainFee,
      totalAmount,
      courierRewardCoins,
      paidWithCoins: useCoins ? 1 : 0,
      deliveryOtp, // Shown only to the student!
      status: 'Placed'
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Failed to place classroom order.' });
  }
});

// Student gets their own orders (includes their own delivery OTP & fee breakdown!)
router.get('/orders/my', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.*,
             vol.name as volunteer_name,
             vol.role as volunteer_role,
             vol.roll_no as volunteer_roll
      FROM delivery_orders o
      LEFT JOIN users vol ON o.volunteer_id = vol.id
      WHERE o.user_id = ?
      ORDER BY o.id DESC
    `).all(req.user.id);

    const parsed = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items_json || '[]')
    }));

    res.json({ orders: parsed });
  } catch (error) {
    console.error('Error fetching my orders:', error);
    res.status(500).json({ message: 'Failed to retrieve orders.' });
  }
});

// Volunteer & Staff Delivery Dashboard pool (Excludes OTP for security, includes courier reward coins!)
router.get('/orders/pool', authenticateToken, requireRoles('volunteer', 'staff', 'admin'), (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.id, o.order_number, o.classroom_location, o.student_year,
             o.items_json, o.items_summary, o.subtotal, o.delivery_fee,
             o.surge_fee, o.rain_fee, o.total_amount, o.courier_reward_coins,
             o.paid_with_coins, o.status,
             o.created_at, o.delivered_at, o.volunteer_id,
             u.name as student_name, u.roll_no as student_roll, u.branch as student_branch,
             vol.name as volunteer_name, vol.role as volunteer_role
      FROM delivery_orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN users vol ON o.volunteer_id = vol.id
      WHERE o.status IN ('Placed', 'Accepted', 'Out for delivery')
         OR (o.status = 'Delivered' AND DATE(o.created_at, 'localtime') = DATE('now', 'localtime'))
      ORDER BY 
        CASE o.status 
          WHEN 'Placed' THEN 1 
          WHEN 'Accepted' THEN 2 
          WHEN 'Out for delivery' THEN 3 
          ELSE 4 
        END,
        o.id DESC
    `).all();

    const parsed = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items_json || '[]')
    }));

    res.json({ orders: parsed });
  } catch (error) {
    console.error('Error fetching delivery pool:', error);
    res.status(500).json({ message: 'Failed to retrieve delivery orders.' });
  }
});

// Volunteer / Staff accepts a delivery order
router.patch('/orders/:id/accept', authenticateToken, requireRoles('volunteer', 'staff', 'admin'), (req, res) => {
  try {
    const { id } = req.params;

    const order = db.prepare('SELECT id, user_id, order_number, status FROM delivery_orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.status !== 'Placed') {
      return res.status(400).json({ message: `Order cannot be accepted because it is currently "${order.status}".` });
    }

    db.prepare(`
      UPDATE delivery_orders
      SET volunteer_id = ?, status = 'Accepted'
      WHERE id = ?
    `).run(req.user.id, id);

    // Notify student
    createNotification(
      order.user_id,
      'order',
      'Order Accepted!',
      `Order #${order.order_number} has been accepted by ${req.user.name} (${req.user.role}). Preparing your meal!`,
      '/classroom-delivery'
    );

    res.json({
      message: `Order accepted! Student has been notified that ${req.user.name} is preparing and delivering this order.`,
      status: 'Accepted',
      volunteerName: req.user.name,
      volunteerRole: req.user.role
    });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ message: 'Failed to accept order.' });
  }
});

// Volunteer / Staff marks order Out for Delivery
router.patch('/orders/:id/out-for-delivery', authenticateToken, requireRoles('volunteer', 'staff', 'admin'), (req, res) => {
  try {
    const { id } = req.params;

    const order = db.prepare('SELECT id, user_id, order_number, status, classroom_location, volunteer_id FROM delivery_orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.status !== 'Accepted') {
      return res.status(400).json({ message: 'Order must be in "Accepted" status before heading out.' });
    }

    db.prepare(`
      UPDATE delivery_orders
      SET status = 'Out for delivery'
      WHERE id = ?
    `).run(id);

    // Notify student
    createNotification(
      order.user_id,
      'order',
      'Meal Out for Delivery!',
      `Your order #${order.order_number} is on the way to ${order.classroom_location}. Keep your 4-digit OTP ready!`,
      '/classroom-delivery'
    );

    res.json({
      message: 'Status updated: Out for delivery! Head to the classroom with hot meals.',
      status: 'Out for delivery'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order.' });
  }
});

// Volunteer enters student's 4-digit OTP to complete delivery AND EARNS DIGITAL COINS
router.post('/orders/:id/verify-otp', authenticateToken, requireRoles('volunteer', 'staff', 'admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    if (!otp || !otp.toString().trim()) {
      return res.status(400).json({ message: 'Please enter the 4-digit OTP provided by the student.' });
    }

    const order = db.prepare(`
      SELECT id, user_id, order_number, delivery_otp, otp_used, status, classroom_location,
             courier_reward_coins, delivery_fee, surge_fee, rain_fee
      FROM delivery_orders
      WHERE id = ?
    `).get(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.status === 'Delivered' || order.otp_used === 1) {
      return res.status(400).json({ message: 'This order has already been marked Delivered. OTP cannot be reused.' });
    }

    const submittedOtp = otp.toString().trim();
    if (submittedOtp !== order.delivery_otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP! Please check the 4-digit code shown on the student’s phone screen.'
      });
    }

    // Calculate courier reward coins
    const rewardCoins = order.courier_reward_coins || ((order.delivery_fee || 10) + (order.surge_fee || 0) + (order.rain_fee || 0) + 5);

    // OTP matched! Mark Delivered and invalidate OTP
    db.prepare(`
      UPDATE delivery_orders
      SET status = 'Delivered', otp_used = 1, delivered_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    // CREDIT THE COURIER (VOLUNTEER OR STAFF) WITH CAMPUS COINS!
    const newCourierBalance = recordCoinTransaction(
      req.user.id,
      rewardCoins,
      'delivery_earnings',
      order.order_number,
      `Peer courier reward for delivery #${order.order_number} to ${order.classroom_location}`
    );

    // Notify the courier with digital currency reward alert
    createNotification(
      req.user.id,
      'order',
      `Earned +${rewardCoins} Campus Coins! 🪙`,
      `You completed delivery #${order.order_number} to ${order.classroom_location}. ${rewardCoins} coins credited to your wallet (New Balance: ${newCourierBalance || 0} Coins).`,
      '/classroom-delivery'
    );

    // Notify student buyer
    createNotification(
      order.user_id,
      'order',
      'Meal Delivered! 🎉',
      `Order #${order.order_number} was delivered at ${order.classroom_location}. Enjoy your meal!`,
      '/classroom-delivery'
    );

    res.json({
      success: true,
      message: `Delivery confirmed at ${order.classroom_location}! You earned ${rewardCoins} Campus Coins! 🪙`,
      status: 'Delivered',
      coinsEarned: rewardCoins,
      newBalance: newCourierBalance
    });
  } catch (error) {
    console.error('Error verifying delivery OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP.' });
  }
});

export default router;
