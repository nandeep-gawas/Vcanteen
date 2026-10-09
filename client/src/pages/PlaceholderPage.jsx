import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Clock,
  QrCode,
  AlertTriangle,
  Star,
  CalendarCheck,
  Bike,
  ArrowLeft,
  Sparkles,
  Database,
  Layers,
  CheckCircle2
} from 'lucide-react';

const placeholderConfigs = {
  '/break-slots': {
    title: 'Break Slots Management',
    subtitle: 'Staggered break scheduling to eliminate lunch counter crowding',
    icon: Clock,
    color: 'from-orange-500 to-amber-500',
    bgLight: 'bg-orange-50',
    borderColor: 'border-orange-200',
    roles: ['Student', 'Staff', 'Admin'],
    dbTable: 'break_slots (id, slot_name, start_time, end_time, max_capacity, current_capacity, is_active)',
    features: [
      'Staggered lunch batches by department & academic year',
      'Real-time seat availability indicator per 30-min window',
      'Dynamic threshold throttling when dining hall hits 85% occupancy',
      'Notification triggers when your batch slot is ready for entry'
    ]
  },
  '/pre-booking': {
    title: 'Pre-Booking & Token Allocation',
    subtitle: 'Digital meal tokens with zero physical counter wait time',
    icon: CalendarCheck,
    color: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    roles: ['Student', 'Staff'],
    dbTable: 'bookings (id, user_id, slot_id, token_number, status, booking_date)',
    features: [
      'Advance token generation with unique QR verification',
      'Express takeaway pick-up lanes for pre-booked tokens',
      'Daily menu reservation with automated allergen notices',
      'No-show detection to release unclaimed meals to waiting students'
    ]
  },
  '/classroom-delivery': {
    title: 'Classroom Delivery (Volunteer Fleet)',
    subtitle: 'Peer-to-peer hot food courier system right to your lecture hall or lab',
    icon: Bike,
    color: 'from-amber-500 to-yellow-500',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
    roles: ['Student', 'Volunteer', 'Staff'],
    dbTable: 'delivery_orders (id, user_id, volunteer_id, classroom_location, items_summary, total_amount, status)',
    features: [
      'Campus map pin selector for block, floor, and classroom/lab',
      'Volunteer dispatch pool with priority routing for students with free periods',
      'Live order status tracking (Requested -> Accepted -> Picked Up -> Delivered)',
      'Volunteer merit points redeemable for free canteen refreshments'
    ]
  },
  '/entry-counter': {
    title: 'Entry Counter & Turnstile Flow',
    subtitle: 'RFID & QR scanner station to regulate dining hall capacity in real time',
    icon: QrCode,
    color: 'from-indigo-500 to-blue-500',
    bgLight: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    roles: ['Canteen Staff', 'Admin'],
    dbTable: 'entry_logs (id, user_id, entry_type [in/out], scanned_by, timestamp)',
    features: [
      'Instant roll number & token barcode scanner at turnstiles',
      'Automated head-count display with green/amber/red traffic light status',
      'Unauthorized entry detection during non-allocated year slots',
      'Peak surge analytics for college administrative reporting'
    ]
  },
  '/complaints': {
    title: 'Grievance Redressal & Hygiene Complaints',
    subtitle: 'Direct feedback channel to canteen committee and dean of student welfare',
    icon: AlertTriangle,
    color: 'from-rose-500 to-red-500',
    bgLight: 'bg-rose-50',
    borderColor: 'border-rose-200',
    roles: ['Student', 'Volunteer', 'Staff', 'Admin'],
    dbTable: 'complaints (id, user_id, title, description, category, status, resolution_notes)',
    features: [
      'Category tags: Food Quality, Cleanliness, Billing, Staff Behavior, Queue Delays',
      'Direct assignment to canteen supervisor with SLA resolution timer',
      'Photo evidence upload support for rapid hygiene inspections',
      'Public resolution logs for student body transparency'
    ]
  },
  '/reviews': {
    title: 'Food Reviews & Menu Suggestions',
    subtitle: 'Student taste ratings and crowd-sourced weekly menu improvements',
    icon: Star,
    color: 'from-purple-500 to-fuchsia-500',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200',
    roles: ['Student', 'Staff', 'Admin'],
    dbTable: 'reviews & suggestions (ratings, comments, upvotes, status)',
    features: [
      '5-star dish rating system for daily rotating special items',
      'Crowd-sourced suggestion box with student upvoting leaderboard',
      'Chef feedback portal to discontinue unpopular low-rated items',
      'Top rated dish of the week highlights on the main dashboard'
    ]
  }
};

export default function PlaceholderPage() {
  const location = useLocation();
  const config = placeholderConfigs[location.pathname] || {
    title: 'Module Under Construction',
    subtitle: 'This feature is part of the VCanteen queue reduction platform roadmap.',
    icon: Sparkles,
    color: 'from-orange-500 to-amber-500',
    bgLight: 'bg-orange-50',
    borderColor: 'border-orange-200',
    roles: ['All Users'],
    dbTable: 'Ready in database schema',
    features: ['Feature implementation scheduled for Phase 2']
  };

  const Icon = config.icon;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </Link>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Sidebar Placeholder Shell
        </span>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${config.color} text-white flex items-center justify-center shadow-lg flex-shrink-0`}>
            <Icon className="w-8 h-8" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {config.title}
              </h1>
            </div>
            <p className="text-sm text-slate-600">
              {config.subtitle}
            </p>
          </div>
        </div>

        {/* Roles Supported */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
            Target Roles:
          </span>
          {config.roles.map((role) => (
            <span
              key={role}
              className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Backend & DB Integration Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3 text-slate-800 font-bold text-sm">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>SQLite Schema Connected</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            The database table and relationships for this module are already created and verified in <code className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">vcanteen.db</code>:
          </p>
          <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
            {config.dbTable}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3 text-slate-800 font-bold text-sm">
            <Layers className="w-4 h-4 text-orange-600" />
            <span>Phase 2 Implementation Scope</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            {config.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="rounded-2xl p-4 bg-orange-50/70 border border-orange-200/70 flex items-center justify-between text-xs text-orange-800">
        <span>
          💡 <strong>Placeholder Ready:</strong> This page is properly wired in the sidebar routing shell. Full interactive forms and real-time flows can be enabled in Phase 2.
        </span>
        <Link
          to="/dashboard"
          className="ml-4 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition flex-shrink-0 shadow-xs"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
