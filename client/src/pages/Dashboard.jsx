import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UtensilsCrossed,
  Clock,
  QrCode,
  AlertTriangle,
  Star,
  CalendarCheck,
  Bike,
  Users,
  ChevronRight,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  Activity,
  Layers,
  ShoppingBag,
  ShieldCheck,
  MapPin,
  Flame,
  ArrowRight
} from 'lucide-react';
import LiveOccupancyMeter from '../components/LiveOccupancyMeter';
import StudentBreakCountdown from '../components/StudentBreakCountdown';
import StudentQRPassModal from '../components/StudentQRPassModal';
import AdminDashboardHome from '../components/AdminDashboardHome';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchStats();
    }
  }, [token]);

  const featureCards = [
    {
      title: 'Break Slots',
      desc: 'Year-wise staggered break timetable and countdown timer.',
      path: '/break-slots',
      icon: Clock,
      badge: 'Year Timetable',
      color: 'from-orange-500 to-amber-500',
      badgeColor: 'bg-orange-100 text-orange-800'
    },
    {
      title: 'Gate Scanner',
      desc: 'Turnstile webcam scanner with capacity checks and slot verification.',
      path: '/entry-counter',
      icon: QrCode,
      badge: 'Staff Station',
      color: 'from-indigo-500 to-blue-500',
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      title: 'Pre-Booking',
      desc: 'Reserve meal tokens in advance and collect without waiting.',
      path: '/pre-booking',
      icon: CalendarCheck,
      badge: 'Zero-Wait Food',
      color: 'from-emerald-500 to-teal-500',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      title: 'Classroom Delivery',
      desc: 'Student volunteers deliver fresh hot meals straight to classrooms.',
      path: '/classroom-delivery',
      icon: Bike,
      badge: 'Peer Logistics',
      color: 'from-amber-500 to-yellow-500',
      badgeColor: 'bg-amber-100 text-amber-900'
    },
    {
      title: 'Complaints',
      desc: 'Report queue delays, hygiene issues, or cold food directly to staff.',
      path: '/complaints',
      icon: AlertTriangle,
      badge: 'Fast Redressal',
      color: 'from-rose-500 to-red-500',
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      title: 'Reviews & Feedback',
      desc: 'Rate daily specials and upvote menu suggestions for next week.',
      path: '/reviews',
      icon: Star,
      badge: 'Food Quality',
      color: 'from-purple-500 to-fuchsia-500',
      badgeColor: 'bg-purple-100 text-purple-800'
    }
  ];

  const isStudent = user?.role === 'student';
  const isStaffOrAdmin = ['staff', 'admin'].includes(user?.role);

  if (user?.role === 'admin') {
    return (
      <div className="space-y-8">
        <AdminDashboardHome />

        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Canteen Operations Modules
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct access to turnstiles, break timetable, complaints portal, and food delivery pool
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.path}
                  to={card.path}
                  className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center font-bold shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-3 group-hover:text-orange-500 transition">
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {card.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 p-6 sm:p-8 text-white shadow-xl shadow-orange-600/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold text-white mb-3">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>VCanteen Active Queue Reduction</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Student'}! 👋
            </h1>
            <p className="mt-1.5 text-sm text-orange-100 max-w-xl">
              Staggered year breaks, real-time webcam gate verification, and 5s live dining capacity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isStudent && (
              <button
                onClick={() => setQrModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-white text-orange-700 hover:bg-orange-50 font-black text-xs transition shadow-md flex items-center gap-2"
              >
                <QrCode className="w-4 h-4 text-orange-600" />
                <span>My Entry QR Pass</span>
              </button>
            )}

            {isStaffOrAdmin && (
              <Link
                to="/entry-counter"
                className="px-4 py-2.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-black text-xs transition shadow-md flex items-center gap-2"
              >
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span>Open Gate Scanner</span>
              </Link>
            )}

            <div className="px-4 py-2 rounded-2xl bg-white/15 backdrop-blur border border-white/20 text-center">
              <span className="block text-[11px] font-medium text-orange-200">Role</span>
              <span className="font-bold text-sm tracking-wide capitalize">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-12 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>
      </div>

      {/* FEATURE 2: Live Occupancy Meter (Refreshes every 5 seconds) */}
      <LiveOccupancyMeter />

      {/* FEATURE 1: Student Live Year Break Countdown */}
      {isStudent && user?.year && (
        <StudentBreakCountdown token={token} userYear={user.year} />
      )}

      {/* Student QR Pass Modal */}
      {isStudent && (
        <StudentQRPassModal
          student={user}
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
        />
      )}

      {/* Role-Specific Custom Dashboard View */}
      {user?.role === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Active Booking Card */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  Meal Booking Token
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Ready at Counter
                </span>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 text-center">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-widest block">Token Number</span>
                <span className="text-3xl font-black text-slate-900 font-mono tracking-wider">VC-1082</span>
                <div className="mt-2 text-xs text-slate-600 font-medium">
                  Lunch Batch 1 (Year 1 & 2)
                </div>
              </div>
            </div>
            <Link
              to="/pre-booking"
              className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              View meal details & QR <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Digital QR Entry Pass Card */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  Turnstile QR Pass
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                  Ready to Scan
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <p className="text-xs font-bold text-slate-800">ID: {user.roll_no.toUpperCase()}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Scans toggle Entry/Exit automatically at canteen gate</p>
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition w-full shadow-xs"
                >
                  View Large QR Pass
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Requires scanning during your Year {user.year} slot
            </p>
          </div>

          {/* Classroom Delivery Status */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-orange-600" />
                  Classroom Delivery
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  In Transit
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Destination:</span>
                    <span>Lab 304, IT Block, 3rd Floor</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                  <p className="font-medium text-slate-800">2x Veg Grilled Sandwich, Cold Coffee</p>
                  <p className="text-[11px] text-slate-500 mt-1">Volunteer: Rohan V. (3rd Yr Mech)</p>
                </div>
              </div>
            </div>
            <Link
              to="/classroom-delivery"
              className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition"
            >
              Track volunteer location <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {user?.role === 'volunteer' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              Campus Delivery Pool
            </span>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-800">2 Requests</p>
              <p className="text-xs text-slate-500 mt-1">Classrooms waiting for lunch delivery in Main Block</p>
            </div>
            <Link
              to="/classroom-delivery"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              Accept next delivery <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-emerald-600" />
              Active Assignment
            </span>
            <div className="mt-3">
              <p className="text-sm font-bold text-slate-800">Lab 304, IT Block</p>
              <p className="text-xs text-slate-500 mt-0.5">Order for Aarav Sharma (₹180)</p>
            </div>
            <span className="mt-3 inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Picked up from Counter 3
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4 text-purple-600" />
              Volunteer Rating & Perks
            </span>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-800">4.9 / 5.0 ⭐</p>
              <p className="text-xs text-slate-500 mt-1">14 completed deliveries this semester</p>
            </div>
            <p className="mt-3 text-xs font-medium text-emerald-700">Eligible for Canteen Discount Pass</p>
          </div>
        </div>
      )}

      {user?.role === 'staff' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/entry-counter" className="rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 p-5 border border-indigo-200 shadow-xs transition group">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-indigo-700 uppercase">Live Turnstile Scanner</p>
              <ChevronRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition" />
            </div>
            <p className="text-2xl font-black text-indigo-950 mt-2">Active Station</p>
            <p className="text-xs text-indigo-600 font-medium mt-1">Scan QR codes with webcam</p>
          </Link>
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase">Today's Meal Bookings</p>
            <p className="text-3xl font-black text-slate-900 mt-2">124</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">↑ 18% over yesterday</p>
          </div>
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase">Volunteer Deliveries</p>
            <p className="text-3xl font-black text-slate-900 mt-2">18</p>
            <p className="text-xs text-amber-600 font-medium mt-1">2 orders awaiting pickup</p>
          </div>
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase">Active Slots</p>
            <p className="text-3xl font-black text-slate-900 mt-2">4</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Year 1-4 Lunch Windows</p>
          </div>
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/break-slots" className="rounded-2xl bg-orange-50 hover:bg-orange-100/80 p-5 border border-orange-200 shadow-xs transition group">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-orange-700 uppercase">Manage Slots</p>
              <ChevronRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition" />
            </div>
            <p className="text-2xl font-black text-orange-950 mt-2">4 Year Slots</p>
            <p className="text-xs text-orange-600 font-medium mt-1">Edit times & capacity</p>
          </Link>
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase">Registered Students</p>
            <p className="text-3xl font-black text-slate-900 mt-2">4</p>
            <p className="text-xs text-slate-500 mt-1">Year 1 to 4 active</p>
          </div>
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase">Open Grievances</p>
            <p className="text-3xl font-black text-rose-600 mt-2">{stats?.openComplaintsCount ?? 2}</p>
            <p className="text-xs text-slate-500 mt-1">Avg resolution time: 24h</p>
          </div>
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase">Hygiene Rating</p>
            <p className="text-3xl font-black text-amber-500 mt-2">4.7 / 5.0</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Student review index</p>
          </div>
        </div>
      )}

      {/* Feature Modules Launchpad Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Queue Reduction Modules</h2>
            <p className="text-xs text-slate-500">
              Interactive feature modules built for VCanteen dining operations
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            Features 1 & 2 Live
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.path}
                to={card.path}
                className="group relative flex flex-col justify-between p-6 bg-white rounded-3xl border border-slate-200/80 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600">
                  <span>Open Module</span>
                  <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
