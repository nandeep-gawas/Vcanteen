const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.resolve(__dirname, '../VCanteen_Complete_User_and_Testing_Manual.pdf');
console.log('Generating manual to:', outputPath);

const doc = new PDFDocument({
  margin: 50,
  size: 'LETTER',
  bufferPages: true,
  autoFirstPage: true
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Theme Colors
const C = {
  primary: '#0F172A',     // Slate 900
  secondary: '#1E293B',   // Slate 800
  accent: '#D97706',      // Amber 600
  accentLight: '#FEF3C7', // Amber 100
  accentDark: '#92400E',  // Amber 800
  brandOrange: '#EA580C', // Orange 600
  brandEmerald: '#059669',// Emerald 600
  brandIndigo: '#4F46E5', // Indigo 600
  text: '#1E293B',        // Main text
  textMuted: '#64748B',   // Secondary text
  bgLight: '#F8FAFC',     // Light background
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  codeBg: '#F1F5F9',
  tableHeader: '#1E293B',
  tableZebra: '#F8FAFC',
  successBg: '#ECFDF5',
  successBorder: '#10B981',
  warningBg: '#FFFBEB',
  warningBorder: '#F59E0B',
  infoBg: '#EFF6FF',
  infoBorder: '#3B82F6',
  dangerBg: '#FEF2F2',
  dangerBorder: '#EF4444'
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2); // 512pt
const BOTTOM_MARGIN = 60;
const MAX_Y = PAGE_HEIGHT - BOTTOM_MARGIN;

// Helper: Ensure enough space on page or create new page
function checkPageBreak(neededHeight) {
  if (doc.y + neededHeight > MAX_Y) {
    doc.addPage();
    drawPageHeader();
    return true;
  }
  return false;
}

let currentChapterTitle = '';

function drawPageHeader() {
  if (doc._pageBuffer.length === 1) return; // Skip cover
  doc.save();
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.textMuted);
  doc.text('VCANTEEN: COMPLETE OPERATIONAL & TESTING MANUAL', MARGIN, 28, { width: CONTENT_WIDTH, align: 'left' });
  if (currentChapterTitle) {
    doc.font('Helvetica').fontSize(7.5).fillColor(C.brandOrange);
    doc.text(currentChapterTitle, MARGIN, 28, { width: CONTENT_WIDTH, align: 'right' });
  }
  doc.strokeColor(C.border).lineWidth(0.5).moveTo(MARGIN, 38).lineTo(PAGE_WIDTH - MARGIN, 38).stroke();
  doc.restore();
  doc.y = 52;
}

// ==========================================
// TYPOGRAPHY & COMPONENT HELPERS
// ==========================================

function chapter(number, title, subtitle) {
  doc.addPage();
  currentChapterTitle = `Chapter ${number}: ${title}`;
  drawPageHeader();
  
  // Chapter badge
  doc.rect(MARGIN, doc.y, 85, 18).fillAndStroke(C.accentLight, C.accent);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.accentDark);
  doc.text(`CHAPTER ${number}`, MARGIN + 6, doc.y + 4.5);
  doc.y += 18;

  // Chapter Title
  doc.font('Helvetica-Bold').fontSize(20).fillColor(C.primary);
  doc.text(title, MARGIN, doc.y, { width: CONTENT_WIDTH });
  
  if (subtitle) {
    doc.font('Helvetica').fontSize(10).fillColor(C.textMuted);
    doc.text(subtitle, MARGIN, doc.y + 3, { width: CONTENT_WIDTH });
    doc.moveDown(0.6);
  }
  
  // Horizontal divider
  doc.strokeColor(C.accent).lineWidth(2).moveTo(MARGIN, doc.y).lineTo(MARGIN + 60, doc.y).stroke();
  doc.strokeColor(C.border).lineWidth(0.5).moveTo(MARGIN + 65, doc.y).lineTo(PAGE_WIDTH - MARGIN, doc.y).stroke();
  doc.moveDown(0.8);
}

function section(title) {
  checkPageBreak(50);
  doc.moveDown(0.6);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(C.secondary);
  doc.text(title, MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.strokeColor(C.border).lineWidth(0.5).moveTo(MARGIN, doc.y + 2).lineTo(PAGE_WIDTH - MARGIN, doc.y + 2).stroke();
  doc.moveDown(0.5);
}

function subSection(title) {
  checkPageBreak(35);
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(C.brandOrange);
  doc.text(title, MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(0.2);
}

function paragraph(text, options = {}) {
  const height = doc.heightOfString(text, { width: CONTENT_WIDTH, align: options.align || 'left', lineGap: 2.5 });
  checkPageBreak(height + 6);
  doc.font(options.bold ? 'Helvetica-Bold' : 'Helvetica')
     .fontSize(options.size || 9.5)
     .fillColor(options.color || C.text);
  doc.text(text, MARGIN, doc.y, {
    width: CONTENT_WIDTH,
    align: options.align || 'left',
    lineGap: 2.5
  });
  doc.moveDown(options.space || 0.4);
}

function bullet(title, text) {
  const bulletSymbol = '•';
  const fullText = title ? `${title}: ${text}` : text;
  const height = doc.heightOfString(fullText, { width: CONTENT_WIDTH - 16, lineGap: 2 });
  checkPageBreak(height + 4);

  const startY = doc.y;
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(C.brandOrange);
  doc.text(bulletSymbol, MARGIN + 4, startY);

  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(C.primary);
  let xOffset = MARGIN + 16;
  if (title) {
    doc.text(title + ': ', xOffset, startY, { continued: true });
    doc.font('Helvetica').fontSize(9.5).fillColor(C.text);
    doc.text(text, { lineGap: 2 });
  } else {
    doc.font('Helvetica').fontSize(9.5).fillColor(C.text);
    doc.text(text, xOffset, startY, { lineGap: 2, width: CONTENT_WIDTH - 16 });
  }
  doc.moveDown(0.3);
}

function step(number, title, description) {
  const descHeight = doc.heightOfString(description, { width: CONTENT_WIDTH - 30, lineGap: 2 });
  checkPageBreak(descHeight + 28);

  const startY = doc.y;
  // Step badge circle/box
  doc.roundedRect(MARGIN, startY, 20, 16, 3).fillAndStroke(C.primary, C.primary);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF');
  doc.text(String(number), MARGIN, startY + 3.5, { width: 20, align: 'center' });

  // Title
  doc.font('Helvetica-Bold').fontSize(10).fillColor(C.primary);
  doc.text(title, MARGIN + 28, startY + 2, { width: CONTENT_WIDTH - 28 });
  doc.moveDown(0.2);

  // Description
  doc.font('Helvetica').fontSize(9.5).fillColor(C.text);
  doc.text(description, MARGIN + 28, doc.y, { width: CONTENT_WIDTH - 28, lineGap: 2 });
  doc.moveDown(0.4);
}

function callout(title, text, type = 'info') {
  let bg = C.infoBg;
  let border = C.infoBorder;
  let titleColor = C.brandIndigo;

  if (type === 'success') {
    bg = C.successBg; border = C.successBorder; titleColor = C.brandEmerald;
  } else if (type === 'warning') {
    bg = C.warningBg; border = C.warningBorder; titleColor = C.accentDark;
  } else if (type === 'danger') {
    bg = C.dangerBg; border = C.dangerBorder; titleColor = '#B91C1C';
  }

  const textHeight = doc.heightOfString(text, { width: CONTENT_WIDTH - 24, lineGap: 2 });
  const totalHeight = textHeight + (title ? 24 : 14);
  checkPageBreak(totalHeight + 6);

  const startY = doc.y;
  // Box
  doc.roundedRect(MARGIN, startY, CONTENT_WIDTH, totalHeight, 4).fillAndStroke(bg, bg);
  // Left border bar
  doc.rect(MARGIN, startY, 4, totalHeight).fill(border);

  let curY = startY + 6;
  if (title) {
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(titleColor);
    doc.text(title, MARGIN + 14, curY, { width: CONTENT_WIDTH - 24 });
    curY += 13;
  }
  doc.font('Helvetica').fontSize(9).fillColor(C.text);
  doc.text(text, MARGIN + 14, curY, { width: CONTENT_WIDTH - 24, lineGap: 2 });

  doc.y = startY + totalHeight + 6;
}

function codeBlock(code) {
  const lines = code.split('\n');
  const height = lines.length * 12 + 14;
  checkPageBreak(height + 6);

  const startY = doc.y;
  doc.roundedRect(MARGIN, startY, CONTENT_WIDTH, height, 4).fillAndStroke(C.codeBg, C.border);

  doc.font('Courier').fontSize(8.5).fillColor('#0F172A');
  doc.text(code, MARGIN + 10, startY + 8, {
    width: CONTENT_WIDTH - 20,
    lineGap: 2
  });

  doc.y = startY + height + 6;
}

function table(headers, rows, colWidths, alignments = []) {
  const rowHeight = 20;
  const headerHeight = 22;
  const totalTableHeight = headerHeight + (rows.length * rowHeight);

  checkPageBreak(headerHeight + (rowHeight * Math.min(rows.length, 3)));

  let curY = doc.y;

  // Header Row
  doc.rect(MARGIN, curY, CONTENT_WIDTH, headerHeight).fill(C.tableHeader);
  let curX = MARGIN;
  headers.forEach((h, i) => {
    const w = colWidths[i];
    const align = alignments[i] || 'left';
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF');
    doc.text(h, curX + 6, curY + 6, { width: w - 12, align });
    curX += w;
  });
  curY += headerHeight;

  // Data Rows
  rows.forEach((row, rIdx) => {
    checkPageBreak(rowHeight + 4);
    if (doc.y !== curY) {
      // New page happened!
      curY = doc.y;
      // Re-draw header
      doc.rect(MARGIN, curY, CONTENT_WIDTH, headerHeight).fill(C.tableHeader);
      let reX = MARGIN;
      headers.forEach((h, i) => {
        const w = colWidths[i];
        const align = alignments[i] || 'left';
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF');
        doc.text(h, reX + 6, curY + 6, { width: w - 12, align });
        reX += w;
      });
      curY += headerHeight;
    }

    const isZebra = rIdx % 2 === 1;
    doc.rect(MARGIN, curY, CONTENT_WIDTH, rowHeight).fill(isZebra ? C.tableZebra : '#FFFFFF');
    doc.strokeColor(C.border).lineWidth(0.5).moveTo(MARGIN, curY + rowHeight).lineTo(PAGE_WIDTH - MARGIN, curY + rowHeight).stroke();

    let rowX = MARGIN;
    row.forEach((cell, cIdx) => {
      const w = colWidths[cIdx];
      const align = alignments[cIdx] || 'left';
      doc.font('Helvetica').fontSize(8.5).fillColor(C.text);
      doc.text(String(cell), rowX + 6, curY + 5.5, { width: w - 12, align });
      rowX += w;
    });

    curY += rowHeight;
    doc.y = curY;
  });

  doc.moveDown(0.6);
}

// ==========================================
// DOCUMENT STRUCTURE GENERATION
// ==========================================

console.log('Writing Cover Page...');

// COVER PAGE
doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill('#0B132B');

// Accent top bar
doc.rect(0, 0, PAGE_WIDTH, 12).fill(C.accent);

// Brand Header Box
doc.rect(MARGIN, 80, CONTENT_WIDTH, 180).fill('#1C2541');
doc.strokeColor(C.accent).lineWidth(1.5).stroke();

doc.font('Helvetica-Bold').fontSize(11).fillColor(C.accent);
doc.text('CAMPUS DINING & QUEUE ELIMINATION PLATFORM', MARGIN + 25, 105, { characterSpacing: 1.5 });

doc.font('Helvetica-Bold').fontSize(32).fillColor('#FFFFFF');
doc.text('VCanteen', MARGIN + 25, 125);

doc.font('Helvetica-Bold').fontSize(14).fillColor('#94A3B8');
doc.text('Smart College Cafeteria Management System', MARGIN + 25, 165);

doc.font('Helvetica').fontSize(10.5).fillColor('#E2E8F0');
doc.text('Comprehensive Operational Manual & Complete End-to-End Testing Guide', MARGIN + 25, 190, { width: CONTENT_WIDTH - 50, lineGap: 3 });

// Metadata Card
doc.roundedRect(MARGIN, 280, CONTENT_WIDTH, 230, 8).fill('#1E293B');
doc.strokeColor('#334155').lineWidth(1).stroke();

doc.font('Helvetica-Bold').fontSize(11).fillColor(C.accent);
doc.text('DOCUMENT SCOPE & SYSTEM PROFILE', MARGIN + 20, 300);

const metaPoints = [
  ['System Name', 'VCanteen Monorepo (Client & Server)'],
  ['Architecture', 'React 18 (Vite) + Tailwind CSS + Node.js (Express) + SQLite (WAL Mode)'],
  ['Core Mission', 'Eliminate 30-minute campus lunch queues via 4 operational pillars'],
  ['Primary Roles', 'Student (Years 1-4), Volunteer Courier, Canteen Staff, Campus Administrator'],
  ['Verification Scope', 'Every Screen, Button, Flow, Form, Modal, API, Role Guard & Test Case'],
  ['Security Model', 'JWT Authentication, Role Guards, Atomic Transactions, 4-Digit OTP Handshake'],
  ['Target Audience', 'Hackathon Evaluators, Canteen Supervisors, Student Couriers & System Auditors'],
  ['Publication Date', 'October 2026 – Hackathon Production Release']
];

let metaY = 325;
metaPoints.forEach(([k, v]) => {
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#94A3B8');
  doc.text(k + ':', MARGIN + 20, metaY, { width: 110 });
  doc.font('Helvetica').fontSize(9).fillColor('#F8FAFC');
  doc.text(v, MARGIN + 135, metaY, { width: CONTENT_WIDTH - 155 });
  metaY += 21;
});

// Pillars Summary Pill Grid
const pillarY = 530;
doc.roundedRect(MARGIN, pillarY, CONTENT_WIDTH, 170, 8).fill('#111827');
doc.strokeColor(C.accent).lineWidth(1).stroke();

doc.font('Helvetica-Bold').fontSize(10.5).fillColor(C.accent);
doc.text('THE 4 OPERATIONAL PILLARS COVERED IN THIS MANUAL', MARGIN + 20, pillarY + 16);

const pillars = [
  ['Pillar 1: Staggered Break Timetable', 'Dynamic slot countdowns separating footfall across Years 1 to 4 with 5-minute surge alerts.'],
  ['Pillar 2: Turnstile QR Gatekeeper', 'Camera QR scanning enforcing physical cafeteria occupancy capacity with emergency staff overrides.'],
  ['Pillar 3: Classroom Food Delivery', 'Zero-footprint peer courier meals delivered to classrooms secured with one-time 4-digit OTPs.'],
  ['Pillar 4: Redressal & VIP Pre-Bookings', 'Ticket timeline tracking with photo evidence and collision-proof party reservation locks.']
];

let pY = pillarY + 38;
pillars.forEach(([pTitle, pDesc]) => {
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#F8FAFC');
  doc.text(pTitle + ' — ', MARGIN + 20, pY, { continued: true });
  doc.font('Helvetica').fontSize(8.5).fillColor('#94A3B8');
  doc.text(pDesc, { width: CONTENT_WIDTH - 40, lineGap: 2 });
  pY += 30;
});

// Footer Notice
doc.font('Helvetica').fontSize(8).fillColor('#64748B');
doc.text('CONFIDENTIAL & PROPRIETARY — VCanteen Engineering Team © 2026. All Rights Reserved.', MARGIN, 735, { align: 'center', width: CONTENT_WIDTH });

console.log('Writing Table of Contents...');

// TABLE OF CONTENTS
chapter('TOC', 'Table of Contents', 'Quick Navigation Across All Manual Sections');

const tocItems = [
  ['Chapter 1: System Purpose & Operational Philosophy', 'The campus congestion bottleneck and 4 engineering pillars'],
  ['Chapter 2: Setup, Native Installation & Execution', 'Single-command startup, Linux native build, and ports'],
  ['Chapter 3: User Personas & Demo Credentials Matrix', 'Login credentials, role permissions, and fast-login buttons'],
  ['Chapter 4: Feature-by-Feature Operational Guide', 'Exhaustive operation manual for each screen and component'],
  ['  4.1 Modern Landing Page & Persona Switcher', 'Value proposition, live impact metrics, and 1-click switcher'],
  ['  4.2 Authentication & Security Controls', 'JWT token storage, role-based route guards, and session security'],
  ['  4.3 Executive Admin Dashboard & Analytics', '6 real-time stat cards, 3 Recharts graphs, and activity stream'],
  ['  4.4 Year-Wise Staggered Break Slots', 'Student live countdown, 5-min warnings, and capacity settings'],
  ['  4.5 Turnstile QR Gatekeeper & Scanner', 'Camera QR scanning, manual Roll entry, and capacity limiter'],
  ['  4.6 Classroom Food Delivery & 4-Digit OTP', 'Cart checkout, courier hub, OTP verification, and menu editor'],
  ['  4.7 VIP Party & Birthday Pre-Booking', 'Double-booking prevention lock and admin review modal'],
  ['  4.8 Grievance & Complaint Redressal', 'Ticket lifecycle with photo evidence, staff assignment, remarks'],
  ['  4.9 Reviews, Ratings & Community Suggestions', 'Multidimensional star audits, suggestion upvotes, and charts'],
  ['  4.10 In-App Notifications Center', 'Live navbar bell, push alerts, and mark-all-read operations'],
  ['  4.11 UI Customization & Dark Mode', 'Theme toggle with localStorage persistence and toast toasts'],
  ['Chapter 5: Step-by-Step End-to-End Test Scripts', '6 comprehensive test walkthroughs with exact inputs and outputs'],
  ['  Test Script 1: Full Classroom Delivery & OTP Handshake', 'Student orders -> Volunteer accepts -> Volunteer delivers with OTP'],
  ['  Test Script 2: Turnstile Entry, Exit & Overflow Test', 'Scan in -> Occupancy increases -> Hall full alert -> Scan out'],
  ['  Test Script 3: Party Reservation & Conflict Lock Test', 'Student books -> Admin approves -> Duplicate booking rejected'],
  ['  Test Script 4: Complaint Submission & Resolution Flow', 'Student ticket -> Staff assignment -> Remarks -> Verification'],
  ['  Test Script 5: Break Slot Timetable & Live Countdown', 'Year-specific slot assignment and live ticking countdown clock'],
  ['  Test Script 6: Reviews, Suggestions & Upvotes Test', 'Star ratings audit, suggestion submission, and duplicate vote block'],
  ['Chapter 6: Technical Architecture & API Cheat Sheet', 'SQLite database schema (13 tables) and REST API reference'],
  ['Chapter 7: Troubleshooting, FAQs & Maintenance', 'Database re-seeding, camera issues, port conflicts, and security']
];

tocItems.forEach(([item, desc]) => {
  const isSub = item.startsWith('  ');
  checkPageBreak(24);
  doc.font(isSub ? 'Helvetica' : 'Helvetica-Bold')
     .fontSize(isSub ? 8.5 : 9.5)
     .fillColor(isSub ? C.text : C.primary);
  doc.text(item, isSub ? MARGIN + 12 : MARGIN, doc.y, { width: CONTENT_WIDTH - (isSub ? 12 : 0) });
  doc.font('Helvetica-Oblique').fontSize(8).fillColor(C.textMuted);
  doc.text(desc, isSub ? MARGIN + 24 : MARGIN + 12, doc.y, { width: CONTENT_WIDTH - 24 });
  doc.moveDown(0.3);
});

console.log('Writing Chapter 1...');

// CHAPTER 1
chapter(1, 'System Purpose & Architecture', 'Understanding the campus challenge and the 4 queue-reducing pillars');

section('1.1 The Campus Bottleneck');
paragraph('In traditional university and college campuses, over 800 students are released from academic lectures and laboratories simultaneously when the afternoon break bell rings. This creates severe operational failure points:');

bullet('Dangerous Checkout Queues', 'Single-point billing lines stretch 25 to 35 minutes, leaving students barely 5 minutes to consume their food.');
bullet('Hazardous Overcrowding', 'Cafeteria halls frequently exceed legal fire safety occupancy limits by over 200%, resulting in suffocating and stressful conditions.');
bullet('Missed Academic Sessions', 'Students regularly arrive late to afternoon laboratory practicals or examinations due to food collection delays.');
bullet('Accountability Void', 'Food quality complaints and hygiene issues are forgotten or dismissed with zero tracking, feedback loops, or resolution records.');

section('1.2 The 4 Queue Reduction Pillars');
paragraph('VCanteen solves these systemic problems by distributing crowd volume across space, time, and peer networks rather than expanding dining hall square footage:');

bullet('Pillar 1: Year-Wise Staggered Break Slots', 'Instead of releasing everyone at 12:30 PM, the campus schedule is segmented into 30-minute dedicated windows per academic year (1st Years at 12:00, 2nd Years at 12:30, 3rd Years at 13:00, 4th Years at 13:30). Each student sees a real-time countdown clock and receives proactive 5-minute surge warnings.');
bullet('Pillar 2: Turnstile QR Gatekeeper', 'A digital turnstile scanner placed at the cafeteria entrance tracks every student entering and leaving. When the dining hall reaches its safety limit (default: 100 occupants), the scanner locks entry and displays "CANTEEN FULL", preventing dangerous overcrowding.');
bullet('Pillar 3: Classroom Food Delivery & 4-Digit OTP', 'Students studying in distant departmental laboratories or seminar halls order meals directly to their classroom. Student volunteers act as couriers during their free hours. Delivery orders are decoupled from hall occupancy and verified using a secure 4-digit One-Time Password (OTP).');
bullet('Pillar 4: Transparent Grievance Redressal & VIP Reservations', 'A full-cycle ticketing system tracks student feedback with photographic evidence. For campus birthdays and department club celebrations, an automated reservation engine eliminates double-booking conflicts.');

section('1.3 Monorepo Architecture Overview');
paragraph('VCanteen is engineered as a modern, lightweight, highly performant full-stack monorepo:');

callout('Technology Stack Highlights', 
'• Frontend: React 18 with Vite build tool, Tailwind CSS for editorial design, Lucide React icons, Recharts for dynamic visual analytics, and HTML5-QRCode for cross-platform camera turnstile scanning.\n' +
'• Backend: Node.js with Express 4 RESTful API, JSON Web Token (JWT) stateless authentication, bcryptjs password hashing, and Multer for complaint evidence uploads.\n' +
'• Database: SQLite powered by better-sqlite3 operating in Write-Ahead Logging (WAL) mode with foreign key enforcement and high-performance indexes.\n' +
'• Reporting: Embedded PDFKit engine capable of generating reports and documentation on demand.', 'info');

console.log('Writing Chapter 2...');

// CHAPTER 2
chapter(2, 'Setup, Installation & Server Execution', 'Complete instructions for running and verifying the application');

section('2.1 System Prerequisites');
paragraph('Before starting, ensure your system has the following tools installed:');
bullet('Node.js', 'Version 18.0.0 or higher (Node v20 or v22 LTS recommended).');
bullet('npm', 'Version 9.0.0 or higher.');
bullet('Modern Web Browser', 'Google Chrome, Mozilla Firefox, Brave, or Microsoft Edge with webcam permissions enabled.');

section('2.2 Clean Native Installation (Single Command)');
paragraph('Because VCanteen includes native compiled C++ modules (such as better-sqlite3 for high-speed database access), dependencies must be built natively for your operating system:');

codeBlock(
'# Navigate to the project root directory\n' +
'cd ~/Downloads/"New folder"\n\n' +
'# Install root, server, and client dependencies natively\n' +
'npm run install:all'
);

paragraph('The "npm run install:all" script executes:');
codeBlock('npm install && npm install --prefix server && npm install --prefix client');

section('2.3 Populating Pristine Demo Data');
paragraph('VCanteen includes an automated database seeder that populates 30 students across all 4 years, student couriers, canteen staff, campus dean admin, 10 menu items, active orders with OTPs, pre-bookings, turnstile entry logs, complaints, reviews, and notifications:');

codeBlock('npm run seed');

callout('Database Re-seed Guarantee', 
'You can run "npm run seed" at any time to completely reset the application back to its pristine demonstration state. All tables are cleared in strict foreign key order and repopulated within 2 seconds.', 'success');

section('2.4 Starting Backend & Frontend Concurrently');
paragraph('To launch both the Express backend API and the Vite React frontend in parallel:');

codeBlock('npm run dev');

paragraph('The server will start and display:');
codeBlock(
'🚀 VCanteen Backend running on http://localhost:5000\n' +
'📡 Health Check: http://localhost:5000/api/health\n' +
'📁 Uploads available at: http://localhost:5000/uploads\n' +
'➜  Local:   http://localhost:5173/'
);

section('2.5 System Port & Endpoint Directory');
table(
  ['Service', 'Port / URL', 'Purpose & Notes'],
  [
    ['Frontend Application', 'http://localhost:5173', 'Main React Single Page Application (SPA)'],
    ['Backend REST API', 'http://localhost:5000', 'Express API serving all data routes'],
    ['API Health Check', 'http://localhost:5000/api/health', 'Returns server status, service name, timestamp'],
    ['Media Uploads', 'http://localhost:5000/uploads', 'Static server for complaint photos/videos'],
    ['Database File', 'server/vcanteen.db', 'SQLite database file in WAL mode']
  ],
  [120, 160, 232]
);

console.log('Writing Chapter 3...');

// CHAPTER 3
chapter(3, 'User Roles & Demo Credentials Matrix', 'Access privileges, role hierarchy, and pre-configured accounts');

section('3.1 Role Hierarchy & Permissions');
paragraph('VCanteen implements strict Role-Based Access Control (RBAC) enforced at both the client route level (ProtectedRoute component) and server API level (verifyToken & requireRole middlewares):');

bullet('Student (Years 1 to 4)', 'Access to personal dashboard, year-specific break countdown, classroom delivery ordering with secret OTP view, birthday pre-booking, complaint submission, reviews, and suggestions.');
bullet('Volunteer (Peer Courier)', 'All student features PLUS the Delivery Courier Hub to inspect pending orders across the campus, accept delivery assignments, and verify student OTPs at the classroom door.');
bullet('Canteen Staff (Supervisors & Chefs)', 'Access to Turnstile QR Gate Scanner (/entry-counter), capacity monitoring, complaint investigation and status advancement, and menu item availability toggling.');
bullet('Campus Administrator (Dean / Facilities Head)', 'Unrestricted access: Executive analytics dashboard with 6 stat cards and 3 Recharts graphs, party pre-booking review (approve/reject with table notes), break slot timetable manager, and global capacity limits.');

section('3.2 Demo Accounts Reference Table');
paragraph('The following pre-seeded credentials are ready for instant testing:');

table(
  ['Role', 'Roll / ID', 'Password', 'Persona Name & Year', 'Key Testing Scope'],
  [
    ['Student (Yr 3)', 'student1', 'pass123', 'Aarav Sharma (3rd Yr CSE)', 'Order meals, view OTP, book party, see countdown'],
    ['Student (Yr 2)', 'student2', 'pass123', 'Priya Patel (2nd Yr ECE)', 'Pending delivery order (OTP: 7193), party request'],
    ['Student (Yr 1)', 'student3', 'pass123', 'Neha Gupta (1st Yr CSE)', 'Freshers break slot test, view out-for-delivery order'],
    ['Student (Yr 4)', 'student4', 'pass123', 'Vikram Rao (4th Yr Mech)', 'Seniors break slot test, delivered order history'],
    ['Volunteer', 'volunteer1', 'pass123', 'Rohan Verma (3rd Yr Mech)', 'Courier hub, accept orders, enter OTP to complete'],
    ['Volunteer', 'volunteer2', 'pass123', 'Sneha Reddy (2nd Yr CSE)', 'Courier hub, inspect pending campus deliveries'],
    ['Canteen Staff', 'staff1', 'pass123', 'Ramesh Kumar (Supervisor)', 'QR Gatekeeper scanner, assign & resolve complaints'],
    ['Kitchen Staff', 'staff2', 'pass123', 'Chef Suresh (Kitchen Lead)', 'Menu availability toggle, culinary reviews review'],
    ['Gate Auditor', 'staff3', 'pass123', 'Anita Singh (Security Lead)', 'Turnstile monitoring, manual roll ID gate override'],
    ['Administrator', 'admin', 'admin123', 'Dr. Sunita Kapoor (Dean)', 'Executive Dashboard, approve bookings, edit slots']
  ],
  [85, 75, 65, 137, 150]
);

section('3.3 1-Click Fast Demo Login');
paragraph('Both the Landing Page ("/") and Login Page ("/login") provide 1-Click Demo Buttons. Clicking "Student", "Volunteer", "Staff", or "Admin" will automatically populate the credentials, authenticate via JWT, and route to the dashboard instantly without manual typing.');

console.log('Writing Chapter 4...');

// CHAPTER 4
chapter(4, 'Feature-by-Feature Operational Manual', 'Detailed operational walkthrough for every screen, tool, and modal');

section('4.1 Modern Landing Page (/)');
paragraph('The landing page introduces the campus dining challenge and demonstrates how VCanteen eliminates congestion:');
bullet('Hero Banner', 'Editorial headline communicating the 74% wait time reduction and zero-congested halls.');
bullet('1-Click Persona Switcher', 'Four interactive cards allowing instant login as Student, Volunteer, Staff, or Admin.');
bullet('Problem Breakdown', 'Side-by-side comparison between the old chaotic cafeteria workflow and the new smart digital pipeline.');
bullet('Live Impact Metrics', '-74% average checkout wait time, 100% OTP handshake accuracy, and zero food queues in academic blocks.');

section('4.2 Executive Admin Dashboard (/dashboard)');
paragraph('Accessible to all authenticated users, this screen dynamically adapts: students see their personal activity, while Administrators and Staff are greeted by the Executive Control Center:');

subSection('6 Real-Time Stat Cards');
bullet('Live Occupancy', 'Real-time headcount inside the dining hall versus max capacity (e.g., 24/100) with a color-shifting progress meter.');
bullet('Today\'s Entries', 'Cumulative total of successful QR turnstile check-ins recorded today.');
bullet('Open Grievances', 'Live counter of student complaints currently in "Open" or "Assigned" status requiring resolution.');
bullet('Active Deliveries', 'Orders currently in "Placed", "Accepted", or "Out for delivery" status across campus.');
bullet('Campus Rating', 'Multidimensional star rating average calculated from student dining reviews.');
bullet('VIP Bookings', 'Upcoming approved and pending party reservations for birthdays and departmental gatherings.');

subSection('3 Interactive Recharts Visualizations');
bullet('Chart 1: Hourly Canteen Rush Footfall', 'Visualizes student footfall from 09:00 AM to 05:00 PM, showing how staggered break slots flatten lunch peaks.');
bullet('Chart 2: Classroom Deliveries by Food Category', 'Bar chart breaking down orders across Rolls & Wraps, South Indian, Snacks, Meals, Beverages, and Rice Bowls.');
bullet('Chart 3: Quality Audit Dimensions', 'Radar/Bar chart scoring Food Taste, Hygiene, Cleanliness, and Staff Behaviour against the 5.0 standard.');

subSection('Live System Activity Feed');
paragraph('Displays a live reverse-chronological event stream of recent orders placed, turnstile check-ins, complaints filed, and party bookings reviewed.');

section('4.3 Year-Wise Staggered Break Slots (/break-slots)');
paragraph('This module eliminates the simultaneous rush of 800+ students by orchestrating dedicated dining windows:');

subSection('Student Experience');
bullet('Personal Break Countdown', 'Automatically detects the student\'s academic year (e.g., Year 3) and displays a ticking countdown timer (Hours : Minutes : Seconds) to their lunch break.');
bullet('5-Minute Surge Alert', 'When the timer hits 5 minutes or less, a prominent warning banner appears: "Break Starting Soon! Head over now to avoid queue surges!" and triggers an in-app notification.');
bullet('Full Campus Timetable', 'A weekly schedule matrix displaying start and end times for all 4 years: 1st Year (12:00-12:30), 2nd Year (12:30-13:00), 3rd Year (13:00-13:30), 4th Year (13:30-14:00).');

subSection('Administrator Controls');
bullet('Add Break Slot', 'Admin can click "+ Add Break Slot" to create a new slot with custom name, target year, start time, end time, and capacity.');
bullet('Edit & Delete Slots', 'Modify existing slot timings or remove obsolete slots with confirmation protection.');
bullet('Dining Hall Capacity Setter', 'Admins can update the global maximum occupancy limit (default: 100), instantly synchronizing with the Gate Scanner.');

section('4.4 Turnstile QR Gatekeeper (/entry-counter)');
paragraph('Restricted to Staff and Admin, this screen functions as the digital bouncer for the cafeteria entrance:');

subSection('Operational Features');
bullet('Webcam / Mobile Camera Scanner', 'Click "Start Camera" to initialize the webcam using html5-qrcode. The scanner continuously listens for student QR codes.');
bullet('Manual ID Entry Fallback', 'If a webcam is unavailable or permissions are denied, staff can type any student roll number (e.g. "student1" or "24CSE01") and click "Verify & Check In".');
bullet('Bi-Directional Entry / Exit Toggle', 'The turnstile automatically tracks student state: 1st scan = ENTRY (increments occupancy), 2nd scan = EXIT (decrements occupancy).');
bullet('Color-Coded Live Occupancy Meter', 'Green when occupancy is under 65%, Amber between 65% and 85%, and Red when over 85%.');
bullet('CANTEEN FULL Safety Lock', 'If the headcount reaches max capacity (e.g., 100/100), new student entries are immediately BLOCKED with a prominent modal warning.');
bullet('Break Window Gatekeeper', 'If a 1st Year student attempts to enter during the 3rd Year window, the scanner warns "OUTSIDE DESIGNATED BREAK SLOT".');
bullet('Emergency Staff Override', 'Staff can click "Emergency Override" to bypass slot restrictions for authorized students or special circumstances.');
bullet('Synthesized Audio Feedback', 'Plays high-pitch chimes for successful entries, soothing tones for exits, and alert buzzes for blocked scans.');
bullet('Live Scan History Log', 'Displays a real-time table of recent turnstile events with timestamp, student roll, entry/exit type, and scanning staff.');

section('4.5 Classroom Food Delivery & 4-Digit OTP (/classroom-delivery)');
paragraph('Eliminates food queues entirely by delivering meals to classrooms and laboratories:');

subSection('Step 1: Browsing Menu & Adding to Cart (Student)');
paragraph('Students filter the curated 10-item menu by category ("Rolls & Wraps", "South Indian", "Snacks", "Meals", "Beverages", "Rice Bowls"). Clicking "Add to Cart" opens the sliding Cart Drawer showing item quantity, individual prices, prep time estimates, and live subtotal.');

subSection('Step 2: Classroom Checkout & Order Placement');
paragraph('In the cart drawer, the student specifies:');
bullet('Classroom / Lab Location', 'e.g., "Lab 304, IT Block, 3rd Floor" or "Seminar Hall 2".');
bullet('Academic Year', 'Dropdown selector confirming their academic batch.');
paragraph('Upon clicking "Confirm & Place Order", the server creates the order, sets status to "Placed", and generates a secure random 4-digit OTP (e.g., "4821").');

subSection('Step 3: Secret OTP Protection on Student Tracking Card');
paragraph('The student switches to the "My Orders" tab. On their active order card, they see:');
bullet('Status Badge', '"Placed" -> "Accepted" -> "Out for delivery" -> "Delivered" with real-time status transitions.');
bullet('Assigned Courier', 'Displays "Delivered by: Rohan Verma (Volunteer)" once accepted.');
bullet('Prominent 4-Digit OTP Display', 'The secret OTP is displayed in a high-contrast security badge with instructions: "Share this 4-digit code with your courier ONLY when your meal is delivered."');

subSection('Step 4: Courier Hub / Delivery Pool (Volunteer)');
paragraph('When logged in as a Volunteer (e.g. "volunteer1"):');
bullet('Pool Inspection', 'The volunteer opens the "Courier Hub" tab to see all unassigned campus orders.');
bullet('Accept Assignment', 'Clicking "Accept Delivery" assigns the volunteer to the order and moves status to "Accepted". The student immediately receives an in-app notification!');
bullet('Mark Out for Delivery', 'Once the meal is collected from the kitchen counter, the volunteer taps "Mark Out for Delivery".');

subSection('Step 5: OTP Handshake at the Classroom Door');
bullet('Verification Trigger', 'At the classroom door, the volunteer taps "Verify OTP & Complete".');
bullet('Security Modal', 'A modal prompts the courier to enter the student\'s 4-digit OTP.');
bullet('Fraud Prevention', 'Entering an incorrect code returns "Invalid OTP. Handshake rejected." Only entering the exact matching OTP successfully marks the order "Delivered", timestamps the record, and burns the OTP (otp_used = 1).');

subSection('Menu Management (Staff & Admin)');
paragraph('Staff and Admin see an extra "Manage Menu" tab where they can add new dishes, modify prices, update prep times, and toggle dish availability on/off in real time.');

section('4.6 VIP Party & Birthday Pre-Booking (/pre-booking)');
paragraph('Manages cafeteria celebrations and club gatherings while preventing space collisions:');

subSection('Student Reservation Request');
paragraph('Students submit a pre-booking with:');
bullet('Event Type', '"Birthday Celebration", "Club / Dept Gathering", "Batch Meetup & Farewell", etc.');
bullet('Date Picker', 'Selects celebration date (restricted to future dates).');
bullet('Time Slot Selector', '"03:30 PM - 05:00 PM" or "05:00 PM - 06:30 PM".');
bullet('Guest Count', 'Number of expected attendees (e.g., 25).');
bullet('Special Requests', 'e.g., "Cake table setup, audio speaker access for 30 minutes".');

subSection('Atomic Double-Booking Prevention');
paragraph('The system queries existing bookings for the chosen date. If a slot is already taken:');
bullet('Visual Lock', 'The time slot radio button is automatically disabled and marked "Already Reserved".');
bullet('Server Validation', 'If two students attempt to book simultaneously, the SQLite database enforces an atomic check and returns HTTP 409 Conflict: "This time slot is already reserved for the selected date."');

subSection('Admin Review & Table Allocation');
paragraph('Administrators open the "Review Requests" tab:');
bullet('Inspection', 'Admin reviews event details, guest count, and student notes.');
bullet('Decision Modal', 'Admin clicks "Review", selects "Approved" or "Rejected", and enters mandatory setup instructions (e.g., "Tables 14-16 reserved near garden side. AV key provided at counter.").');
bullet('Student Alert', 'The decision and instructions are pushed instantly to the student\'s notification bell and displayed on their booking card.');

section('4.7 Grievance & Complaint Redressal (/complaints)');
paragraph('Provides a transparent, auditable digital redressal system:');

subSection('Submitting a Grievance (Student)');
paragraph('Students click "Raise Grievance" and complete:');
bullet('Title & Category', 'Select from "Food Quality", "Hygiene", "Staff", "Pricing", or "Other".');
bullet('Detailed Description', 'Comprehensive explanation of the incident.');
bullet('Photo / Video Evidence', 'Attach image or video files (e.g. undercooked food, empty water dispensers) handled securely via Multer.');
paragraph('On submission, a unique ticket reference is generated (e.g., "VC-2026-0001").');

subSection('Staff Assignment & Status Lifecycle');
paragraph('Canteen Supervisors and Admins review the "All Complaints" queue:');
bullet('Status Pipeline', 'Tickets progress strictly through: Open -> Assigned -> In Progress -> Resolved.');
bullet('Staff Assignment', 'Supervisors assign tickets to specific personnel (e.g., "Chef Suresh" or "Ramesh Kumar").');
bullet('Mandatory Action Remarks', 'Every status transition requires supervisor remarks explaining actions taken (e.g., "Pantry team dispatched fresh water jars").');
bullet('Public Resolution Timeline', 'The student can inspect their ticket timeline at any time to see who handled their issue, when each status changed, and the remarks logged.');

section('4.8 Reviews, Ratings & Community Suggestions (/reviews)');
subSection('Multidimensional Rating Audit');
paragraph('Students submit dining feedback across 4 distinct operational dimensions:');
bullet('4 Star Dimensions', 'Food Taste (1-5), Hygiene (1-5), Cleanliness (1-5), and Staff Behaviour (1-5).');
bullet('Specific Item & Chef Tagging', 'Optional dropdown to attribute feedback to specific dishes (e.g., "Paneer Tikka Roll") and chefs (e.g., "Chef Suresh").');
bullet('Dynamic Analytics Bar Chart', 'Interactive Recharts visualization dynamically re-calculates average scores across all audit dimensions.');

subSection('Community Suggestions Board');
bullet('Submit Ideas', 'Students propose cafeteria enhancements under "Menu Upgrades", "Chef Feedback", or "New Item Request".');
bullet('Interactive Upvoting', 'Peers vote on ideas. SQLite uniqueness constraints ensure each student can only upvote a suggestion once.');
bullet('Administrative Status Tags', 'Ideas are tagged as "Submitted", "Under Review", "Planned", or "Implemented".');

section('4.9 In-App Notifications Center (Navbar Bell)');
paragraph('Located at the top right of every screen, the notification bell provides instant alerts:');
bullet('Pulsing Unread Badge', 'Shows live count of unread messages.');
bullet('Proactive Push Events', 'Automated alerts for order status transitions, OTP delivery handoffs, complaint resolution updates, booking approvals, and 5-minute break warnings.');
bullet('Filter & Quick Action', 'Toggle between "All" and "Unread" notifications, or click "Mark all as read" in one tap.');

section('4.10 UI Customization & Dark Mode');
paragraph('A theme toggle button (Sun/Moon icon) allows seamless switching between Light Mode (editorial warm white and orange) and Dark Mode (near-black slate with high-contrast text). Theme preference is preserved permanently in the browser\'s localStorage.');

console.log('Writing Chapter 5...');

// CHAPTER 5
chapter(5, 'Step-by-Step End-to-End Test Scripts', '6 complete walkthrough scenarios with exact inputs, roles, and verification checkpoints');

section('Test Script 1: Full Classroom Delivery & OTP Handshake Flow');
paragraph('Goal: Verify that a student can order food to a classroom, receive a secret OTP, and have a peer volunteer deliver the order after validating the OTP at the door.');

step(1, 'Log in as Student 1', 'Open http://localhost:5173/login and click the "Student" 1-click login button (or enter "student1" / "pass123").');
step(2, 'Navigate to Classroom Delivery', 'Click "Classroom Delivery" in the sidebar navigation or visit http://localhost:5173/classroom-delivery.');
step(3, 'Build Food Cart', 'Browse the menu. Under "Rolls & Wraps", click "Add to Cart" on "Paneer Tikka Roll". Under "Beverages", add "Chilled Cold Coffee". Notice the floating cart button shows 2 items.');
step(4, 'Enter Delivery Location', 'Click the Cart icon to open the drawer. In "Classroom / Lab Location", type: "Lab 304, IT Block, 3rd Floor". Ensure Year 3 is selected.');
step(5, 'Confirm & Place Order', 'Click "Confirm & Place Order". A success toast appears, and you are redirected to the "My Orders" tab.');
step(6, 'Note the 4-Digit OTP', 'Locate your newly placed order card (Status: "Placed"). Observe the secret 4-Digit OTP displayed in the golden badge (e.g., "8429"). Note this code down!');
step(7, 'Switch to Volunteer Courier', 'Log out (top right menu) and log in as Volunteer ("volunteer1" / "pass123").');
step(8, 'Accept Order in Courier Hub', 'Go to "Classroom Delivery" -> "Courier Hub" tab. Find the order for Lab 304. Click "Accept Delivery". The order moves to your active queue.');
step(9, 'Mark Out for Delivery', 'Click "Mark Out for Delivery". The order status updates instantly.');
step(10, 'Perform OTP Handshake at Door', 'Click "Verify OTP & Complete". In the modal, test typing "0000" and click verify: notice the rejection error! Now enter the correct 4-digit code noted in Step 6 and click verify. Status turns to "Delivered" and OTP is burned!');

section('Test Script 2: Turnstile Entry, Exit & Overflow Test');
paragraph('Goal: Verify turnstile camera/manual QR check-in, live occupancy meter updates, and the "CANTEEN FULL" safety lock.');

step(1, 'Log in as Canteen Staff', 'Log in as "staff1" / "pass123" and navigate to "Gate Scanner" (/entry-counter).');
step(2, 'Inspect Initial Occupancy', 'Check the Live Occupancy Meter at the top. Note the current headcount (e.g. 24 / 100).');
step(3, 'Test Student Entry Scan', 'In the Manual Roll Number input box, type "24CSE01" and click "Verify & Check In". Observe the entry chime and green badge: "ENTRY VERIFIED". Notice occupancy increments to 25.');
step(4, 'Test Student Exit Scan', 'Type the same roll number "24CSE01" again and click "Verify & Check In". Notice the audio chime shifts to exit tone and status displays "EXIT VERIFIED". Headcount decrements back to 24!');
step(5, 'Test Break Slot Violation', 'Type a 1st Year student roll (e.g. "student3") when the active window is for 3rd Years. Observe the warning: "OUTSIDE DESIGNATED BREAK SLOT".');
step(6, 'Test Emergency Staff Override', 'Click "Emergency Override" next to the warning. The scan is authorized and recorded in the audit log.');
step(7, 'Test "CANTEEN FULL" Lockout', 'Log in as "admin" / "admin123", navigate to "Break Slots" (/break-slots), and adjust "Global Max Capacity" to 24. Return to Gate Scanner and attempt to check in any student: observe the prominent red "CANTEEN FULL" blocking modal!');

section('Test Script 3: VIP Party Booking & Double-Booking Conflict');
paragraph('Goal: Verify student party reservations and atomic collision prevention for identical dates and slots.');

step(1, 'Log in as Student 1', 'Log in as "student1" / "pass123" and visit "Party Pre-Booking" (/pre-booking).');
step(2, 'Select Date & Event', 'Choose "Birthday Celebration", select a date 3 days in the future, and select "03:30 PM - 05:00 PM". Set Guest Count to 20.');
step(3, 'Submit Reservation', 'Click "Submit Pre-Booking Request". The request appears in "My Bookings" with a yellow "Pending" badge.');
step(4, 'Log in as Admin to Approve', 'Log out and log in as "admin" / "admin123". Navigate to "Party Pre-Booking" -> "Review Requests" tab.');
step(5, 'Approve with Setup Notes', 'Find Student 1\'s booking, click "Review", select "Approved", and type: "Tables 10-12 reserved near patio. AV speakers activated." Click "Submit Review".');
step(6, 'Verify Student Notification', 'Log back in as "student1". Notice the pulsing red dot on the navbar Bell Icon! Click it to read: "Pre-Booking Approved! Tables 10-12 reserved".');
step(7, 'Test Double-Booking Collision', 'Log in as Student 2 ("student2" / "pass123") and go to "Party Pre-Booking". Select the EXACT same date and time slot. Notice the slot is locked and disabled! Attempting to force submit returns HTTP 409 Conflict.');

section('Test Script 4: Grievance Redressal Lifecycle with Evidence');
paragraph('Goal: File a complaint with attachment, assign to staff, update status with mandatory remarks, and verify timeline.');

step(1, 'Log in as Student', 'Log in as "student1" / "pass123" and go to "Complaints" (/complaints).');
step(2, 'File Complaint with Image', 'Enter Title: "Water Cooler Leaking", Category: "Hygiene", Description: "Water accumulation near entrance creating slipping hazard." (Optional: attach any photo). Click "Submit Grievance".');
step(3, 'Verify Ticket Reference', 'A green toast confirms submission and provides ticket number (e.g. "VC-2026-0004").');
step(4, 'Log in as Supervisor Staff', 'Log out and log in as "staff1" / "pass123". Go to "Complaints" -> "All Complaints" tab.');
step(5, 'Assign Ticket to Personnel', 'Locate the water cooler ticket. Click "Assign Staff", choose "Anita Singh", and submit.');
step(6, 'Update Status to In Progress', 'Click "Update Status", select "In Progress", enter remark: "Housekeeping team dispatched with wet vacuum", and submit.');
step(7, 'Mark Ticket Resolved', 'Click "Update Status" again, select "Resolved", enter remark: "Floor cleaned and drain line cleared", and submit.');
step(8, 'Verify Student Timeline', 'Log back in as "student1" and open "My Complaints". Click on the ticket to inspect the step-by-step resolution timeline showing staff names, timestamps, and remarks.');

section('Test Script 5: Break Slot Timetable & Live Countdown');
paragraph('Goal: Verify dynamic student countdown clocks and administrative slot modifications.');

step(1, 'Log in as Student 1 (Year 3)', 'Log in as "student1" and visit "Break Slots" (/break-slots).');
step(2, 'Observe Live Countdown', 'Check the top countdown card. It automatically detects Year 3 and displays ticking seconds remaining until the 13:00 - 13:30 break.');
step(3, 'Verify 5-Minute Warning', 'Notice the 5-minute surge banner alerting students when their break is approaching.');
step(4, 'Log in as Admin to Add Slot', 'Log in as "admin", go to "Break Slots", and click "+ Add Break Slot". Create a "M.Tech / Faculty Tea Break" at 16:00 - 16:30 with capacity 50.');
step(5, 'Verify Instant Timetable Update', 'The new slot immediately displays in the campus timetable with active status.');

section('Test Script 6: Reviews, Suggestions & Community Upvotes');
paragraph('Goal: Submit dining ratings, propose menu suggestions, and verify single-upvote protection.');

step(1, 'Log in as Student', 'Log in as "student1" and go to "Reviews & Ratings" (/reviews).');
step(2, 'Submit 4-Dimensional Audit', 'Click "Write Review". Set Taste: 5, Hygiene: 5, Cleanliness: 4, Staff: 5. Select "Paneer Tikka Roll" and "Chef Suresh". Enter a comment and submit.');
step(3, 'Verify Analytics Update', 'Switch to the "Audit Analytics" tab. Observe the Recharts bar chart updating average scores.');
step(4, 'Submit Community Suggestion', 'Switch to the "Suggestions" tab. Click "Suggest Idea". Title: "Add Iced Green Tea", Category: "Beverages". Submit.');
step(5, 'Test Peer Upvoting', 'Log in as Student 2 ("student2"), find the Green Tea suggestion, and click the Thumbs Up icon. Notice the vote count increments by 1.');
step(6, 'Verify Anti-Spam Duplicate Vote Block', 'Click the Thumbs Up icon a second time: the system prevents duplicate voting and shows an alert.');

console.log('Writing Chapter 6...');

// CHAPTER 6
chapter(6, 'Database Schema & API Reference Cheat Sheet', 'Complete architectural reference of all 13 database tables and REST endpoints');

section('6.1 SQLite Database Schema (13 Tables)');
paragraph('VCanteen utilizes a clean, relational schema configured with Write-Ahead Logging (WAL) and cascading foreign keys:');

table(
  ['Table Name', 'Primary Key', 'Foreign Keys', 'Core Purpose & Data Stored'],
  [
    ['users', 'id (INTEGER)', 'None', 'Roll number, password hash, role (student/volunteer/staff/admin), year'],
    ['break_slots', 'id (INTEGER)', 'None', 'Slot name, target year (1-4), start time, end time, max capacity'],
    ['canteen_settings', 'key (TEXT)', 'None', 'Key-value config store (e.g. global max_capacity = 100)'],
    ['menu_items', 'id (INTEGER)', 'None', 'Dish name, category, price, image URL, description, prep time, is_available'],
    ['delivery_orders', 'id (INTEGER)', 'user_id, volunteer_id', 'Order number, location, items JSON, total amount, 4-digit delivery_otp, status'],
    ['party_bookings', 'id (INTEGER)', 'user_id, reviewed_by', 'Booking number, event type, date, time slot, guest count, admin_notes, status'],
    ['entry_logs', 'id (INTEGER)', 'user_id, scanned_by', 'Turnstile QR scan record, entry_type (in/out), timestamp, audit notes'],
    ['complaints', 'id (INTEGER)', 'user_id, assigned_to', 'Ticket number, category, title, description, media attachment URL, status'],
    ['complaint_remarks', 'id (INTEGER)', 'complaint_id, user_id', 'Audit history of status changes, timestamps, and staff action remarks'],
    ['reviews', 'id (INTEGER)', 'user_id', 'Taste, hygiene, cleanliness, staff scores (1-5), dish, chef, comments'],
    ['suggestions', 'id (INTEGER)', 'user_id', 'Idea title, description, category, upvote counter, admin status'],
    ['suggestion_upvotes', 'id (INTEGER)', 'suggestion_id, user_id', 'Unique constraint preventing students from casting multiple upvotes on 1 idea'],
    ['notifications', 'id (INTEGER)', 'user_id', 'In-app notification title, message, action link, is_read boolean, timestamp']
  ],
  [95, 65, 100, 252]
);

section('6.2 Backend REST API Reference');
paragraph('All endpoints are prefixed with /api and require Bearer JWT tokens (except public auth routes):');

table(
  ['Method & Endpoint', 'Protected Role', 'Summary & Return Payload'],
  [
    ['POST /api/auth/login', 'Public', 'Validates roll & password; returns JWT token + user profile object'],
    ['POST /api/auth/register', 'Public', 'Registers new student or staff; assigns default student/staff role'],
    ['GET /api/stats/admin', 'Admin / Staff', 'Returns 6 stat cards, hourly footfall, category counts, recent events'],
    ['GET /api/slots', 'All Users', 'Returns all 4 break slots with target year, timings, and live capacity'],
    ['POST /api/slots', 'Admin', 'Creates new break slot; requires slot name, year, start/end times'],
    ['GET /api/gate/occupancy', 'All Users', 'Returns current inside headcount, max capacity, and occupancy percentage'],
    ['POST /api/gate/scan', 'Staff / Admin', 'Processes turnstile QR scan; auto-toggles entry/exit, validates break slot'],
    ['GET /api/delivery/menu', 'All Users', 'Returns all canteen menu items with prices, categories, and prep times'],
    ['POST /api/delivery/orders', 'Student', 'Places classroom order; generates unique 4-digit delivery OTP'],
    ['POST /api/delivery/orders/:id/verify-otp', 'Volunteer / Staff', 'Validates courier-entered OTP; marks order Delivered if correct'],
    ['POST /api/party/bookings', 'Student', 'Creates party booking; enforces atomic double-booking prevention check'],
    ['PATCH /api/party/bookings/:id/review', 'Admin / Staff', 'Approves or rejects party request with custom table setup notes'],
    ['POST /api/complaints', 'All Users', 'Submits grievance with optional Multer file upload; returns ticket number'],
    ['PATCH /api/complaints/:id/status', 'Staff / Admin', 'Advances ticket status (Open->Assigned->InProgress->Resolved) + remarks'],
    ['GET /api/notifications', 'All Users', 'Fetches user notifications; supports unread filter and mark-as-read']
  ],
  [140, 85, 287]
);

console.log('Writing Chapter 7...');

// CHAPTER 7
chapter(7, 'Troubleshooting, FAQs & Maintenance', 'Resolving common operational issues and system maintenance');

section('7.1 Resetting Database to Clean State');
paragraph('If demo data becomes cluttered after extensive testing, reset everything back to factory state:');
codeBlock('npm run seed');
paragraph('This re-creates all 30 students, 10 menu items, active orders with OTPs, pre-bookings, and turnstile logs.');

section('7.2 Testing Turnstile Without a Webcam');
paragraph('If your testing computer does not have a connected webcam or browser permissions are blocked:');
bullet('Do Not Worry', 'You do NOT need a webcam to test the Gatekeeper turnstile!');
bullet('Manual ID Box', 'Open /entry-counter and use the "Manual Student Roll ID" input box.');
bullet('Test IDs', 'Type "student1", "student2", "24CSE01", or "23MECH11" and click "Verify & Check In" to trigger the exact same entry/exit events and audio chimes.');

section('7.3 Port Conflicts & Server Startup Issues');
paragraph('If the terminal reports "Port 5000 in use" or "Port 5173 in use":');
bullet('Port 5000', 'Ensure no previous background node instance is running: execute "killall node" or "fuser -k 5000/tcp".');
bullet('Port 5173', 'Vite will automatically offer port 5174 if 5173 is occupied.');
bullet('.env Configuration', 'Check server/.env to confirm PORT=5000 and JWT_SECRET are defined.');

section('7.4 Session Expiration & Cache');
paragraph('If an API request returns HTTP 401 Unauthorized, your JWT token may have expired. Simply log out and click any 1-Click Demo Login button to refresh your session.');

// Final Sign-off Box
callout('Operational Verification Certified', 
'This manual documents the verified release of VCanteen. All features—including staggered countdowns, turnstile capacity locks, peer classroom delivery with OTP handshakes, conflict-free party reservations, and complaint timelines—have been validated for hackathon evaluation and campus deployment.', 'success');

console.log('Finalizing PDF stream and adding page numbers...');

// End of doc - compute page numbers across all pages
const totalPages = doc.bufferedPageRange().count;
for (let i = 1; i < totalPages; i++) { // Skip cover page (index 0)
  doc.switchToPage(i);
  doc.save();
  doc.font('Helvetica').fontSize(8).fillColor(C.textMuted);
  doc.text(
    `Page ${i + 1} of ${totalPages}`,
    MARGIN,
    PAGE_HEIGHT - 35,
    { width: CONTENT_WIDTH, align: 'right' }
  );
  doc.text(
    'VCanteen System Architecture & Testing Manual — Confidential',
    MARGIN,
    PAGE_HEIGHT - 35,
    { width: CONTENT_WIDTH, align: 'left' }
  );
  doc.strokeColor(C.border).lineWidth(0.5).moveTo(MARGIN, PAGE_HEIGHT - 42).lineTo(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 42).stroke();
  doc.restore();
}

doc.end();

stream.on('finish', () => {
  console.log('PDF generation finished successfully!');
  console.log('File size:', fs.statSync(outputPath).size, 'bytes');
  console.log('Total pages:', totalPages);
});
