import bcrypt from 'bcryptjs';
import db, { initDatabase } from './database.js';

export function seedDatabase() {
  console.log('🌱 Seeding VCanteen database with 30 students, staff, orders, bookings, logs, and notifications...');
  initDatabase();

  // Clear existing records in correct foreign key order
  db.exec(`
    DELETE FROM notifications;
    DELETE FROM suggestion_upvotes;
    DELETE FROM suggestions;
    DELETE FROM complaint_remarks;
    DELETE FROM complaints;
    DELETE FROM reviews;
    DELETE FROM party_bookings;
    DELETE FROM delivery_orders;
    DELETE FROM menu_items;
    DELETE FROM entry_logs;
    DELETE FROM break_slots;
    DELETE FROM users;
    DELETE FROM canteen_settings;
  `);

  // Default canteen settings
  db.prepare("INSERT INTO canteen_settings (key, value) VALUES ('max_capacity', '100')").run();
  db.prepare("INSERT INTO canteen_settings (key, value) VALUES ('base_delivery_fee', '10')").run();
  db.prepare("INSERT INTO canteen_settings (key, value) VALUES ('surge_fee', '15')").run();
  db.prepare("INSERT INTO canteen_settings (key, value) VALUES ('surge_active', '0')").run();
  db.prepare("INSERT INTO canteen_settings (key, value) VALUES ('rain_fee', '15')").run();
  db.prepare("INSERT INTO canteen_settings (key, value) VALUES ('rain_active', '0')").run();

  const studentPass = bcrypt.hashSync('pass123', 10);
  const adminPass = bcrypt.hashSync('admin123', 10);

  // 1. Insert 30 Students across all 4 Years, plus Volunteers, Staff & Admin
  const insertUser = db.prepare(`
    INSERT INTO users (name, roll_no, year, branch, role, password_hash, coin_balance)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const students = [
    // Year 1 (8 Students)
    { name: 'Neha Gupta', roll: 'student3', year: 1, branch: 'Computer Science' },
    { name: 'Aditya Kulkarni', roll: '24CSE01', year: 1, branch: 'Computer Science' },
    { name: 'Tanvi Deshmukh', roll: '24CSE02', year: 1, branch: 'Computer Science' },
    { name: 'Manish Sharma', roll: '24ECE01', year: 1, branch: 'Electronics & Comm.' },
    { name: 'Pooja Hegde', roll: '24MECH01', year: 1, branch: 'Mechanical Eng.' },
    { name: 'Sahil Kapoor', roll: '24CIVIL01', year: 1, branch: 'Civil Eng.' },
    { name: 'Ishita Roy', roll: '24AIDS01', year: 1, branch: 'AI & Data Science' },
    { name: 'Varun Bhat', roll: '24IT01', year: 1, branch: 'Information Tech' },

    // Year 2 (8 Students)
    { name: 'Priya Patel', roll: 'student2', year: 2, branch: 'Electronics & Comm.' },
    { name: 'Kavya Nair', roll: '23CSE11', year: 2, branch: 'Computer Science' },
    { name: 'Devendra Pandey', roll: '23CSE12', year: 2, branch: 'Computer Science' },
    { name: 'Shreya Iyer', roll: '23ECE11', year: 2, branch: 'Electronics & Comm.' },
    { name: 'Gaurav Joshi', roll: '23MECH11', year: 2, branch: 'Mechanical Eng.' },
    { name: 'Ritika Sen', roll: '23CIVIL11', year: 2, branch: 'Civil Eng.' },
    { name: 'Arjun Nambiar', roll: '23AIDS11', year: 2, branch: 'AI & Data Science' },
    { name: 'Megha Singhania', roll: '23IT11', year: 2, branch: 'Information Tech' },

    // Year 3 (7 Students)
    { name: 'Aarav Sharma', roll: 'student1', year: 3, branch: 'Computer Science' },
    { name: 'Siddharth Rao', roll: '22CSE21', year: 3, branch: 'Computer Science' },
    { name: 'Ananya Mukherjee', roll: '22CSE22', year: 3, branch: 'Computer Science' },
    { name: 'Pranav Saxena', roll: '22ECE21', year: 3, branch: 'Electronics & Comm.' },
    { name: 'Kritika Das', roll: '22MECH21', year: 3, branch: 'Mechanical Eng.' },
    { name: 'Rishi Varma', roll: '22AIDS21', year: 3, branch: 'AI & Data Science' },
    { name: 'Nikhil Chowdary', roll: '22IT21', year: 3, branch: 'Information Tech' },

    // Year 4 (7 Students)
    { name: 'Vikram Rao', roll: 'student4', year: 4, branch: 'Mechanical Eng.' },
    { name: 'Divya Pillai', roll: '21CSE31', year: 4, branch: 'Computer Science' },
    { name: 'Sameer Qureshi', roll: '21CSE32', year: 4, branch: 'Computer Science' },
    { name: 'Rashmi Menon', roll: '21ECE31', year: 4, branch: 'Electronics & Comm.' },
    { name: 'Deepak Tyagi', roll: '21MECH31', year: 4, branch: 'Mechanical Eng.' },
    { name: 'Tarun Reddy', roll: '21AIDS31', year: 4, branch: 'AI & Data Science' },
    { name: 'Zoya Khan', roll: '21IT31', year: 4, branch: 'Information Tech' },
  ];

  const userIds = {};

  for (const s of students) {
    const res = insertUser.run(s.name, s.roll, s.year, s.branch, 'student', studentPass, 100);
    userIds[s.roll] = res.lastInsertRowid;
  }
  console.log(`✅ Seeded ${students.length} students across Years 1 to 4 with 100 Campus Coins each`);

  // Volunteers (Couriers start with 160 coins)
  const volunteers = [
    { name: 'Rohan Verma', roll: 'volunteer1', year: 3, branch: 'Mechanical Eng.' },
    { name: 'Sneha Reddy', roll: 'volunteer2', year: 2, branch: 'Computer Science' },
    { name: 'Karan Malhotra', roll: 'volunteer3', year: 4, branch: 'Electronics & Comm.' },
  ];
  for (const v of volunteers) {
    const res = insertUser.run(v.name, v.roll, v.year, v.branch, 'volunteer', studentPass, 160);
    userIds[v.roll] = res.lastInsertRowid;
  }

  // Staff & Admin
  const staffMembers = [
    { name: 'Ramesh Kumar (Supervisor)', roll: 'staff1', branch: 'Canteen Operations', role: 'staff', pass: studentPass, coins: 200 },
    { name: 'Chef Suresh (Kitchen Lead)', roll: 'staff2', branch: 'Culinary Team', role: 'staff', pass: studentPass, coins: 200 },
    { name: 'Anita Singh (Gate Auditor)', roll: 'staff3', branch: 'Hygiene & Security', role: 'staff', pass: studentPass, coins: 200 },
    { name: 'Dr. Sunita Kapoor (Admin)', roll: 'admin', branch: 'Facilities & Campus Admin', role: 'admin', pass: adminPass, coins: 250 }
  ];
  for (const st of staffMembers) {
    const res = insertUser.run(st.name, st.roll, null, st.branch, st.role, st.pass, st.coins);
    userIds[st.roll] = res.lastInsertRowid;
  }
  console.log('✅ Seeded volunteers, canteen staff & admin with wallet balances');

  // 2. Break Slots for All 4 Academic Years
  const insertSlot = db.prepare(`
    INSERT INTO break_slots (slot_name, target_year, start_time, end_time, max_capacity, current_capacity, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);

  const slots = [
    { name: '1st Year Freshers Lunch', year: 1, start: '12:00', end: '12:30', max: 100, current: 28 },
    { name: '2nd Year Sophomores Lunch', year: 2, start: '12:30', end: '13:00', max: 100, current: 42 },
    { name: '3rd Year Juniors Lunch', year: 3, start: '13:00', end: '13:30', max: 100, current: 65 },
    { name: '4th Year Seniors Lunch', year: 4, start: '13:30', end: '14:00', max: 100, current: 15 }
  ];

  for (const s of slots) {
    insertSlot.run(s.name, s.year, s.start, s.end, s.max, s.current);
  }
  console.log('✅ Seeded 4 staggered break slots');

  // 3. Menu Items
  const insertMenu = db.prepare(`
    INSERT INTO menu_items (name, category, price, image_url, description, is_available, preparation_time)
    VALUES (?, ?, ?, ?, ?, 1, ?)
  `);

  const menu = [
    {
      name: 'Paneer Tikka Roll',
      category: 'Rolls & Wraps',
      price: 90,
      image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
      description: 'Marinated cottage cheese cubes roasted with peppers wrapped in flaky laccha paratha.',
      time: 15
    },
    {
      name: 'Special Masala Dosa',
      category: 'South Indian',
      price: 75,
      image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
      description: 'Crispy fermented crepe served with spicy potato filling, authentic sambar & coconut chutney.',
      time: 12
    },
    {
      name: 'Veg Grilled Cheese Sandwich',
      category: 'Snacks',
      price: 60,
      image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80',
      description: 'Toasted multi-grain bread stuffed with sliced veggies, mint spread & melted mozzarella.',
      time: 10
    },
    {
      name: 'Deluxe College Thali',
      category: 'Meals',
      price: 110,
      image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400&auto=format&fit=crop&q=80',
      description: '2 rotis, Jeera rice, Dal tadka, Paneer butter masala, pickle, salad & sweet gulab jamun.',
      time: 10
    },
    {
      name: 'Crispy Samosa Plate (2 pcs)',
      category: 'Snacks',
      price: 30,
      image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
      description: 'Golden spiced potato turnovers served with sweet tamarind and spicy green mint dip.',
      time: 5
    },
    {
      name: 'Chilled Cold Coffee',
      category: 'Beverages',
      price: 50,
      image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80',
      description: 'Creamy blended iced coffee topped with chocolate syrup drizzle.',
      time: 5
    },
    {
      name: 'Kadak Cutting Chai',
      category: 'Beverages',
      price: 15,
      image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80',
      description: 'Traditional ginger cardamom infused hot milk tea.',
      time: 3
    },
    {
      name: 'Rajma Chawal Bowl',
      category: 'Rice Bowls',
      price: 80,
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80',
      description: 'Slow-cooked red kidney beans in Punjabi masala gravy over steamed basmati rice.',
      time: 8
    },
    {
      name: 'Chole Bhature (2 pcs)',
      category: 'Meals',
      price: 95,
      image_url: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400&auto=format&fit=crop&q=80',
      description: 'Puffy deep-fried sourdough breads served with spiced chickpea curry and pickled onions.',
      time: 12
    },
    {
      name: 'Veg Hakka Noodles',
      category: 'Snacks',
      price: 70,
      image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80',
      description: 'Wok-tossed noodles with shredded bell peppers, cabbage, spring onion & garlic soy sauce.',
      time: 10
    }
  ];

  for (const m of menu) {
    insertMenu.run(m.name, m.category, m.price, m.image_url, m.description, m.time);
  }
  console.log(`✅ Seeded ${menu.length} canteen menu items`);

  // 4. Delivery Orders with Fee Breakdown & 4-Digit OTPs
  const insertDelivery = db.prepare(`
    INSERT INTO delivery_orders (
      order_number, user_id, volunteer_id, classroom_location, student_year,
      items_json, items_summary, subtotal, delivery_fee, surge_fee, rain_fee,
      total_amount, courier_reward_coins, paid_with_coins, delivery_otp, otp_used, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDelivery.run(
    'ORD-2026-101',
    userIds['student1'],
    userIds['volunteer1'],
    'Lab 304, IT Block, 3rd Floor',
    3,
    JSON.stringify([
      { name: 'Paneer Tikka Roll', price: 90, quantity: 2 },
      { name: 'Chilled Cold Coffee', price: 50, quantity: 1 }
    ]),
    '2x Paneer Tikka Roll, 1x Chilled Cold Coffee',
    230.00,
    10.00,
    0.00,
    0.00,
    240.00,
    15,
    0,
    '4821',
    0,
    'Accepted'
  );

  insertDelivery.run(
    'ORD-2026-102',
    userIds['student2'],
    null,
    'Room 102, Main Academic Block, 1st Floor',
    2,
    JSON.stringify([
      { name: 'Special Masala Dosa', price: 75, quantity: 1 },
      { name: 'Kadak Cutting Chai', price: 15, quantity: 1 }
    ]),
    '1x Special Masala Dosa, 1x Kadak Cutting Chai',
    90.00,
    10.00,
    0.00,
    0.00,
    100.00,
    15,
    0,
    '7193',
    0,
    'Placed'
  );

  insertDelivery.run(
    'ORD-2026-103',
    userIds['student3'],
    userIds['volunteer2'],
    'Seminar Hall 2, B-Wing, 2nd Floor',
    1,
    JSON.stringify([
      { name: 'Veg Grilled Cheese Sandwich', price: 60, quantity: 2 },
      { name: 'Chilled Cold Coffee', price: 50, quantity: 2 }
    ]),
    '2x Veg Grilled Cheese Sandwich, 2x Chilled Cold Coffee',
    220.00,
    10.00,
    0.00,
    0.00,
    230.00,
    15,
    0,
    '3382',
    0,
    'Out for delivery'
  );

  insertDelivery.run(
    'ORD-2026-100',
    userIds['student4'],
    userIds['volunteer1'],
    'Workshop Bay 4, Mech Block',
    4,
    JSON.stringify([
      { name: 'Crispy Samosa Plate (2 pcs)', price: 30, quantity: 2 },
      { name: 'Kadak Cutting Chai', price: 15, quantity: 2 }
    ]),
    '2x Crispy Samosa Plate, 2x Kadak Cutting Chai',
    90.00,
    10.00,
    0.00,
    0.00,
    100.00,
    15,
    0,
    '1042',
    1,
    'Delivered'
  );
  console.log('✅ Seeded delivery orders with itemized courier delivery fees');

  // Seed sample coin ledger transactions
  const insertCoinTx = db.prepare(`
    INSERT INTO coin_transactions (user_id, amount, type, reference_id, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  // volunteer1 earned coins on delivery
  insertCoinTx.run(userIds['volunteer1'], 15, 'delivery_earnings', 'ORD-2026-100', 'Peer courier delivery reward for #ORD-2026-100 (Workshop Bay 4)');
  insertCoinTx.run(userIds['volunteer1'], 25, 'delivery_earnings', 'ORD-2026-095', 'Peer courier delivery reward (+₹15 rain fee allowance)');
  insertCoinTx.run(userIds['volunteer1'], 120, 'bonus', 'WELCOME-BONUS', 'Campus Volunteer Courier Welcome Grant');

  // student1 welcome bonus
  insertCoinTx.run(userIds['student1'], 100, 'bonus', 'WELCOME-GRANT', 'Semester Campus Dining Digital Allowance');
  console.log('✅ Seeded coin transaction ledgers');

  // 5. Party / Birthday Pre-Bookings
  const insertParty = db.prepare(`
    INSERT INTO party_bookings (
      booking_number, user_id, event_type, booking_date, time_slot,
      guest_count, special_requests, status, admin_notes, reviewed_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const d1 = new Date();
  d1.setDate(d1.getDate() + 2);
  const dateStr1 = d1.toISOString().split('T')[0];

  const d2 = new Date();
  d2.setDate(d2.getDate() + 4);
  const dateStr2 = d2.toISOString().split('T')[0];

  insertParty.run(
    'PB-2026-001',
    userIds['student1'],
    'Birthday Celebration',
    dateStr1,
    '03:30 PM - 05:00 PM',
    25,
    'Reserved tables near garden side, cake table setup, sound system access for 30 mins.',
    'Approved',
    'Tables 14-16 reserved. Sound equipment checked with AV in-charge.',
    userIds['admin']
  );

  insertParty.run(
    'PB-2026-002',
    userIds['student2'],
    'Club / Dept Gathering',
    dateStr2,
    '05:00 PM - 06:30 PM',
    35,
    'ECE Department technical symposium team celebration and snacks distribution.',
    'Pending',
    null,
    null
  );
  console.log('✅ Seeded party & birthday pre-bookings');

  // 6. Turnstile Entry Logs for Live Occupancy Simulation
  const insertEntry = db.prepare(`
    INSERT INTO entry_logs (user_id, entry_type, scanned_by, notes, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Simulate entries today
  const todayDate = new Date().toISOString().split('T')[0];
  const activeInsideRolls = [
    'student1', 'student2', '24CSE01', '24CSE02', '24ECE01', '24MECH01',
    '23CSE11', '23CSE12', '23ECE11', '23MECH11', '22CSE21', '22CSE22',
    '22ECE21', '22MECH21', '21CSE31', '21CSE32', '21ECE31', '24AIDS01',
    '23AIDS11', '22AIDS21', '21AIDS31', '24IT01', '23IT11', '22IT21'
  ];

  for (const r of activeInsideRolls) {
    if (userIds[r]) {
      insertEntry.run(userIds[r], 'in', userIds['staff3'], 'Turnstile QR scan verified', `${todayDate} 12:45:00`);
    }
  }

  // Also simulate students who entered earlier and exited
  const exitedRolls = ['student3', 'student4', '24CIVIL01', '23CIVIL11', '21MECH31', '21IT31'];
  for (const r of exitedRolls) {
    if (userIds[r]) {
      insertEntry.run(userIds[r], 'in', userIds['staff3'], 'Turnstile QR scan verified', `${todayDate} 12:05:00`);
      insertEntry.run(userIds[r], 'out', userIds['staff3'], 'Turnstile Exit scan', `${todayDate} 12:35:00`);
    }
  }
  console.log(`✅ Seeded ${activeInsideRolls.length} live campus occupants and turnstile footfall logs`);

  // 7. Complaints & Status Remarks
  const insertComplaint = db.prepare(`
    INSERT INTO complaints (
      ticket_number, user_id, title, description, category, status, assigned_to, resolution_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const c1 = insertComplaint.run(
    'VC-2026-0001',
    userIds['student1'],
    'Water Dispenser Refill Needed in Block Canteen',
    'The cold drinking water dispenser in the dining hall has been empty since 11:30 AM today.',
    'Hygiene',
    'In Progress',
    userIds['staff1'],
    'Maintenance team dispatched 2 fresh 20L jars.'
  );

  const c2 = insertComplaint.run(
    'VC-2026-0002',
    userIds['student2'],
    'South Indian Billing Counter Bottleneck',
    'Only 1 token printer was active during 12:45 peak rush, creating 15-minute queues.',
    'Staff',
    'Assigned',
    userIds['staff1'],
    null
  );

  const c3 = insertComplaint.run(
    'VC-2026-0003',
    userIds['student3'],
    'Cold Samosas Served at Evening Snack Counter',
    'Ordered 2 plates at 4:30 PM and the samosas were room temperature instead of freshly fried.',
    'Food Quality',
    'Resolved',
    userIds['staff2'],
    'Warming cabinet heating element replaced. Free coupon provided to student.'
  );

  const insertRemark = db.prepare(`
    INSERT INTO complaint_remarks (complaint_id, user_id, from_status, to_status, remarks)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertRemark.run(c1.lastInsertRowid, userIds['staff1'], 'Open', 'In Progress', 'Assigned to pantry housekeeping staff.');
  insertRemark.run(c2.lastInsertRowid, userIds['admin'], 'Open', 'Assigned', 'Directing supervisor Ramesh to open auxiliary register.');
  insertRemark.run(c3.lastInsertRowid, userIds['staff2'], 'In Progress', 'Resolved', 'Inspection completed and batch verified.');
  console.log('✅ Seeded complaints with staff remarks timeline');

  // 8. Reviews
  const insertReview = db.prepare(`
    INSERT INTO reviews (
      user_id, food_taste, hygiene, cleanliness, staff_behaviour, overall_rating, comment, food_item, chef_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertReview.run(
    userIds['student1'], 5, 5, 4, 5, 4.8,
    'The Paneer Tikka Roll was hot, flavorful and loaded with filling! Super fast delivery.',
    'Paneer Tikka Roll', 'Chef Suresh'
  );

  insertReview.run(
    userIds['student2'], 4, 5, 5, 4, 4.5,
    'Special Masala Dosa is the best breakfast item on campus. Sambar is piping hot and fresh.',
    'Special Masala Dosa', 'Chef Suresh'
  );

  insertReview.run(
    userIds['student3'], 5, 4, 4, 4, 4.3,
    'Cold coffee is thick and heavenly during hot afternoon labs.',
    'Chilled Cold Coffee', null
  );

  insertReview.run(
    userIds['student4'], 4, 4, 5, 5, 4.5,
    'Deluxe Thali is great value for ₹110. Clean stainless steel trays and quick refill service.',
    'Deluxe College Thali', 'Chef Suresh'
  );
  console.log('✅ Seeded reviews & student ratings');

  // 9. Suggestions with Upvotes
  const insertSuggestion = db.prepare(`
    INSERT INTO suggestions (user_id, title, description, category, upvotes, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const s1 = insertSuggestion.run(
    userIds['student1'],
    'Add Fresh Seasonal Fruit Juices Counter',
    'Adding watermelon, orange, and mosambi juice without added sugar would be amazing for fitness-conscious students.',
    'New Item Request',
    24,
    'Under Review'
  );

  const s2 = insertSuggestion.run(
    userIds['student2'],
    'Introduce UPI Quick-Pay QR Stands at Every Table',
    'Students could scan a table QR to pay without lining up at the physical billing counter.',
    'Menu Upgrades',
    38,
    'Planned'
  );

  // Upvotes
  const insertUpvote = db.prepare(`INSERT INTO suggestion_upvotes (suggestion_id, user_id) VALUES (?, ?)`);
  insertUpvote.run(s1.lastInsertRowid, userIds['student2']);
  insertUpvote.run(s1.lastInsertRowid, userIds['student3']);
  insertUpvote.run(s2.lastInsertRowid, userIds['student1']);
  insertUpvote.run(s2.lastInsertRowid, userIds['student4']);
  console.log('✅ Seeded suggestions with upvotes');

  // 10. In-App Notifications for Demo Accounts
  const insertNotification = db.prepare(`
    INSERT INTO notifications (user_id, type, title, message, link, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  // Notifications for student1 (Aarav - Year 3)
  insertNotification.run(
    userIds['student1'],
    'break',
    'Break Starting Soon!',
    'Your Year 3 break slot begins at 13:00. Head over now to avoid queue surges!',
    '/break-slots',
    0,
    '-5 minutes'
  );

  insertNotification.run(
    userIds['student1'],
    'order',
    'Order Accepted!',
    'Order #ORD-2026-101 has been accepted by Rohan Verma (Volunteer). Preparing your meal!',
    '/classroom-delivery',
    0,
    '-15 minutes'
  );

  insertNotification.run(
    userIds['student1'],
    'booking',
    'Pre-Booking Approved! 🎉',
    'Your Birthday Celebration on ' + dateStr1 + ' (03:30 PM - 05:00 PM) was approved by Admin. Tables 14-16 reserved!',
    '/pre-booking',
    0,
    '-1 hour'
  );

  insertNotification.run(
    userIds['student1'],
    'complaint',
    'Complaint In Progress',
    'Your complaint #VC-2026-0001 (Water Dispenser) is now In Progress. Pantry staff dispatched.',
    '/complaints',
    1,
    '-2 hours'
  );

  // Notification for student2 (Priya - Year 2)
  insertNotification.run(
    userIds['student2'],
    'order',
    'Order Placed Successfully',
    'Order #ORD-2026-102 placed! Waiting for courier pickup. Your 4-digit OTP is 7193.',
    '/classroom-delivery',
    0,
    '-10 minutes'
  );

  // Notification for volunteer1 (Rohan)
  insertNotification.run(
    userIds['volunteer1'],
    'order',
    'New Delivery Request in Pool',
    'New delivery request #ORD-2026-102 at Room 102, Main Academic Block. Tap to accept!',
    '/classroom-delivery',
    0,
    '-8 minutes'
  );

  console.log('✅ Seeded demo notifications for bell icon verification');
  console.log('🎉 VCanteen database seeding complete!');
}

seedDatabase();
