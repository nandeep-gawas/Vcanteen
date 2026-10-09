# 🍽️ VCanteen – Smart College Queue Reducer

> **A Full-Stack Smart Dining & Queue Elimination Platform for Campus Cafeterias**  
> Built for hackathon demo with **React (Vite) + Tailwind CSS**, **Node.js (Express)**, and **SQLite (better-sqlite3 in WAL mode)** in a unified monorepo.

---

## 🎯 The Problem & Our Solution

### The Campus Bottleneck
In traditional college campuses, **800+ students are released simultaneously** for lunch, triggering:
- 🕒 **25 to 35-minute checkout queues** leaving students barely 5 minutes to eat.
- 🛑 **Hazardous overcrowding** exceeding dining hall fire safety limits by over 200%.
- 🏃‍♂️ **Late or missed laboratory sessions** because students are stranded in food queues.
- 📝 **Lost complaints & cold meals** with zero feedback loops or staff accountability.

### The VCanteen Solution
VCanteen tackles queue congestion through **4 operational pillars**:
1. **Year-Wise Staggered Break Slots:** Separates student footfall across Years 1 to 4 with live student countdowns.
2. **Turnstile QR Gatekeeper:** Webcam scanner enforcing max hall capacity (default: 100) and slot verification.
3. **Classroom Food Delivery with 4-Digit OTP:** Peer couriers deliver meals to labs/classrooms; orders never congest the canteen!
4. **Transparent Redressal & VIP Pre-Booking:** Ticket timeline tracking with photo evidence, plus double-booking prevention for campus parties.

---

## 🚀 Quickstart & Setup (Single Command)

### Prerequisites
- Node.js (v18+)
- npm

### 1. Install Dependencies
```bash
npm run install:all
```
*(Or `npm install && npm install --prefix server && npm install --prefix client`)*

### 2. Seed Realistic Demo Data
Populates the database with **30 students across all 4 years**, volunteers, canteen staff, admin, menu items, active orders, bookings, complaints, reviews, turnstile logs, and demo notifications:
```bash
npm run seed
```

### 3. Launch Both Client & Server Concurrently
```bash
npm run dev
```

- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Uploaded Media Storage:** [http://localhost:5000/uploads](http://localhost:5000/uploads)

---

## 👥 Demo Login Credentials (1-Click Login Supported)

The **Landing Page (`/`)** and **Sign In (`/login`)** screens include **1-Click Demo Login buttons** for instant evaluation by hackathon judges:

| Role | Roll / ID | Password | Demo Persona | Key Flows to Demo |
| :--- | :--- | :--- | :--- | :--- |
| **Student (Yr 3)** | `student1` | `pass123` | Aarav Sharma (3rd Yr CSE) | • Year 3 break countdown & 5-min warning<br>• Place classroom food delivery order (see 4-digit OTP)<br>• Pre-book birthday celebration & check double-booking block<br>• In-app notification bell with live unread count |
| **Volunteer** | `volunteer1` | `pass123` | Rohan Verma (3rd Yr Mech) | • Open **Classroom Delivery** ➔ **Courier Hub**<br>• Accept pending orders, mark out for delivery<br>• Input student's 4-digit OTP to complete delivery |
| **Canteen Staff** | `staff1` | `pass123` | Ramesh Kumar (Supervisor) | • Open **Gate Scanner** (`/entry-counter`) for webcam QR scans<br>• Assign complaints to staff and update status<br>• Toggle menu item availability |
| **Administrator** | `admin` | `admin123` | Dr. Sunita Kapoor (Dean / Admin) | • **Admin Dashboard Home:** 6 live stat cards & 3 Recharts analytics<br>• Review and approve/reject party pre-bookings with notes<br>• Configure break slots & capacity thresholds |

---

## 🌟 Complete Feature Matrix

### 1. 🌐 Modern Landing Page (`/`)
- Explains the peak-hour canteen problem and the 4 queue-reducing pillars.
- **1-Click Interactive Persona Switcher:** Jump into Student, Volunteer, Staff, or Admin mode with a single tap.
- Live campus impact metrics (-74% wait time, 100% OTP handshake accuracy).

### 2. 📊 Executive Admin Dashboard Home (`/dashboard`)
- **6 Real-Time Stat Cards:**
  1. **Live Occupancy:** Headcount inside vs. max capacity (e.g., 24/100) with visual progress bar.
  2. **Today's Entries:** Total turnstile QR scans today.
  3. **Open Grievances:** Complaints pending staff action.
  4. **Active Deliveries:** Orders in Placed, Accepted, or Out for delivery.
  5. **Campus Rating:** Multidimensional average star rating across reviews.
  6. **VIP Bookings:** Upcoming party reservations.
- **3 Interactive Recharts Visualizations:**
  - **Chart 1:** Hourly Canteen Rush Footfall (09:00 AM - 05:00 PM) showing peak flattening.
  - **Chart 2:** Classroom Deliveries by Food Category (Rolls, South Indian, Snacks, Beverages, Meals).
  - **Chart 3:** Quality Audit Dimensions (Taste, Hygiene, Cleanliness, Staff Behaviour against target 5.0).
- **Live System Activity Feed:** Real-time event stream of recent orders, complaints, and bookings.

### 3. 🔔 In-App Notifications Center (Bell Icon)
- Located on the top navigation bar with a live pulsing unread badge.
- Automatically pushes notifications for:
  - 📋 **Complaint status changes** and staff remarks.
  - 🚲 **Order status changes** (Accepted, Out for delivery, Delivered).
  - 🎉 **Party pre-booking approval/rejection** with admin instructions.
  - ⏰ **"Your break starts in 5 minutes!"** automated proactive alerts.
- Filter by All vs. Unread with "Mark all as read" button.

### 4. 🚲 Classroom Food Delivery & Campus Coins Economy (`/classroom-delivery`)
- **Campus Food Menu:** 10 curated items with images, descriptions, prices, and prep times. Admin/Staff can add, edit, or toggle availability.
- **Dynamic Delivery Fees & Weather Allowances:**
  - **Base Courier Delivery Charge:** ₹10 standard per classroom delivery.
  - **Rush Hour Surge Charge:** ₹15 during high-congestion periods.
  - **Monsoon Rain Allowance:** ₹15 incentive during wet/stormy weather.
  - **Live Weather & Surge Controls:** Staff/Admin can toggle Monsoon Rain Mode or Surge Pricing in 1 click right from the delivery header.
- **🪙 Campus Coins Digital Currency:**
  - **Zero Cash Payout Burden for College:** Instead of institutional cash payroll, student volunteers and couriers earn **Campus Coins** credited directly to their in-app wallet upon verified OTP delivery.
  - **Courier Earnings Calculation:** Couriers receive 100% of the delivery fee + surge fee + rain fee + a 5-coin reliability bonus (e.g. up to **30-45 Campus Coins per trip**).
  - **Spend or Redeem:** Students and couriers can pay for their canteen meals directly using Campus Coins (`1 Coin = ₹1`), or pay via Cash/UPI on delivery.
  - **In-App Wallet Modal:** Top navbar displays live coin balance pill (`🪙 {balance}`); clicking opens transaction history ledger, earning rates, and demo allowance top-up.
- **Unique 4-Digit OTP Handshake:** Auto-generated per order and **visible only to the student** on their tracking card.
- **Volunteer Courier Hub:** Peer couriers view available orders in the pool with live coin reward badges (`🪙 Earn +30 Coins`).
- **OTP Gatekeeping at the Door:** The courier must enter the student's 4-digit OTP. Upon successful verification, the order is marked Delivered and coins are atomically credited to the courier's digital wallet with instant notification alerts.
- **Occupancy Decoupling:** Classroom deliveries bypass the dining hall and **never increment canteen occupancy counts**.

### 5. 🎉 VIP Party & Birthday Pre-Booking (`/pre-booking`)
- Students pre-book the canteen dining area for birthdays or club gatherings (event type, date, time slot, guest count, special requests).
- **Atomic Double-Booking Prevention:** Automatically disables taken slots in real-time and rejects duplicate slot reservations with HTTP `409 Conflict`.
- **Admin Review Console:** Authorities approve or reject with custom setup notes (e.g., *"Tables 14-16 reserved near garden with AV sound access"*), displayed directly to the student.

### 6. 🕒 Year-Wise Break Staggering & Countdown (`/break-slots`)
- Admin creates and edits slots per year (1st Year: 12:00-12:30, 2nd Year: 12:30-1:00, 3rd Year: 1:00-1:30, 4th Year: 1:30-2:00).
- Student dashboard automatically displays their own batch's slot with a live ticking countdown timer.
- Proactive 5-minute warning banner alerts students when their slot is opening soon.

### 7. 📷 QR Turnstile Gate Scanner (`/entry-counter`)
- Uses `html5-qrcode` to scan student QR codes via webcam or phone camera.
- Scanning toggles student state: 1st scan = **ENTRY**, 2nd scan = **EXIT**.
- Enforces max capacity limits; displays a high-visibility **CANTEEN FULL** warning when at capacity.
- Blocks students scanning outside their year's designated break window (with staff emergency override).
- Live occupancy progress meter (green ➔ amber ➔ red) auto-refreshes every 5 seconds.

### 8. 📝 Complaint Redressal System (`/complaints`)
- Students submit complaints with category (*Food Quality, Hygiene, Staff, Pricing, Other*), description, and photo/video file uploads via `multer`.
- Generates unique ticket numbers (e.g., `VC-2026-0001`).
- Admin/Staff filter by status/category, assign to staff, and advance tickets: `Open` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved` with mandatory remarks.
- Student "My Complaints" timeline tracks resolution progress step-by-step.

### 9. ⭐ Reviews, Ratings & Suggestions (`/reviews`)
- 1 to 5-star ratings on Food Taste, Hygiene, Cleanliness, and Staff Behaviour.
- Community suggestions board with interactive upvoting counters.
- Visual ratings bar chart powered by Recharts.

### 10. 🌓 Polish & Dark Mode
- **Dark Mode Toggle:** Sun/Moon button on top navbar with smooth theme persistence in `localStorage`.
- **Toast Notifications:** Animated feedback popups for cart updates, order placements, and OTP verification.
- **Empty States:** Clean illustrations when lists or carts are empty.
- **Mobile Responsive:** Collapsible sliding navigation drawer for mobile and tablet screens.

---

## 🛠️ Architecture & Tech Stack

```
VCanteen Monorepo
├── client/                     # Frontend Single Page App
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Sidebar, AdminDashboardHome, Meter, Bell)
│   │   ├── context/            # AuthContext, ThemeContext, ToastContext
│   │   ├── pages/              # Landing, Dashboard, Delivery, PreBooking, Complaints, Reviews...
│   │   └── App.jsx             # React Router routing
│   └── package.json            # React, Vite, Tailwind CSS, Recharts, Lucide, HTML5-QRCode
│
├── server/                     # Backend API Server
│   ├── src/
│   │   ├── db/                 # SQLite database setup (database.js) & seed data (seed.js)
│   │   ├── middleware/         # JWT authentication & role-based route guards
│   │   ├── routes/             # Auth, Stats, Delivery, Party, Complaints, Gate, Slots, Notifications
│   │   └── server.js           # Express API entrypoint
│   └── vcanteen.db             # SQLite database in WAL mode
│
└── package.json                # Single npm run dev command via concurrently
```

---

## 🧪 Verification & Automated Testing

All features, database constraints, double-booking prevention, OTP verification, and notification dispatches have been thoroughly verified with automated integration scripts and full production builds (`npm run build`).

Enjoy exploring **VCanteen**! 🎓🍽️
