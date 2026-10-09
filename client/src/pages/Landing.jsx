import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  UtensilsCrossed,
  Clock,
  QrCode,
  Bike,
  ShieldCheck,
  AlertTriangle,
  Star,
  CalendarCheck,
  ArrowRight,
  CheckCircle2,
  Users,
  Flame,
  Sparkles,
  Zap,
  TrendingDown,
  Sun,
  Moon,
  Shield,
  UserCheck
} from 'lucide-react';

export default function Landing() {
  const { user, login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loggingInRole, setLoggingInRole] = useState(null);

  // Quick 1-Click Demo Login for hackathon judges
  const handleQuickLogin = async (roll_no, password, roleLabel) => {
    setLoggingInRole(roleLabel);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roll_no, password })
      });

      if (res.ok) {
        const data = await res.json();
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        alert('Failed demo login. Please try standard sign in.');
      }
    } catch (err) {
      console.error('Demo login error:', err);
    } finally {
      setLoggingInRole(null);
    }
  };

  const demoPersonas = [
    {
      role: 'Student',
      name: 'Aarav Sharma',
      detail: 'Year 3 • Computer Science',
      roll: 'student1',
      pass: 'pass123',
      color: 'from-orange-500 to-amber-500',
      badge: 'Student Pass',
      features: ['Year 3 countdown', 'Classroom food order', '4-digit OTP pass', 'Party pre-booking']
    },
    {
      role: 'Volunteer',
      name: 'Rohan Verma',
      detail: 'Year 3 Mech • Peer Courier',
      roll: 'volunteer1',
      pass: 'pass123',
      color: 'from-emerald-500 to-teal-500',
      badge: 'Campus Courier',
      features: ['Pending delivery pool', 'Accept classroom runs', 'OTP gatekeeper check', 'Earn volunteer points']
    },
    {
      role: 'Canteen Staff',
      name: 'Ramesh Kumar',
      detail: 'Supervisor & Gate Manager',
      roll: 'staff1',
      pass: 'pass123',
      color: 'from-indigo-500 to-blue-500',
      badge: 'Kitchen Ops',
      features: ['Gate turnstile scanner', 'Capacity alerts', 'Ticket redressal', 'Menu availability toggle']
    },
    {
      role: 'Administrator',
      name: 'Dr. Sunita Kapoor',
      detail: 'Dean / Campus Facilities',
      roll: 'admin',
      pass: 'admin123',
      color: 'from-rose-500 to-pink-500',
      badge: 'Full Access',
      features: ['Live analytics & charts', 'Party request review', 'Footfall monitoring', 'Break slot configuration']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                VCanteen
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Queue Reducer
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-md shadow-orange-500/20 transition"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60 text-orange-800 dark:text-orange-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Smart College Canteen & Dining Logistics</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Tired of 30-Minute Lunch Lines?{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500">
              VCanteen Eliminates The Rush.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            The full-stack queue reducer built for colleges: year-wise staggered break slots, QR turnstile capacity gatekeeping, classroom food delivery with 4-digit OTP handshakes, and transparent grievance resolution.
          </p>

          {/* Quick CTA & Stats Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#demo-section"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/25 flex items-center gap-2 transform hover:-translate-y-0.5 transition"
            >
              <Zap className="w-5 h-5" />
              <span>1-Click Live Demo Logins</span>
            </a>

            <a
              href="#solution-section"
              className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-bold text-sm sm:text-base text-slate-700 dark:text-slate-200 shadow-xs flex items-center gap-2 transition"
            >
              <span>Explore Features</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* Key Metrics */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-orange-500">-74%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Peak Wait Time</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-500">100%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">OTP Handshake Proof</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-indigo-500">0 Overcrowd</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Turnstile QR Caps</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-rose-500">0 Collisions</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Party Pre-Booking</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-16 sm:py-20 bg-slate-100/50 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              The Campus Bottleneck
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
              Why Traditional College Canteens Fail
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
              Every day, thousands of students storm the cafeteria at the exact same bell, resulting in dining chaos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Peak Hour Crush</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                800+ students all released at 1:00 PM, causing 25-minute checkout queues and leaving barely 5 minutes to eat.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Dangerous Overcrowding</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Zero visibility into hall capacity leads to students wandering with food trays with nowhere to sit.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Missed Lectures & Labs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Students rush between academic blocks, missing attendance or skipping meals entirely due to unpredictable lines.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Zero Feedback & Redressal</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Cold samosas, empty water jars, and billing issues vanish into the void with no staff accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The VCanteen Solution Section */}
      <section id="solution-section" className="py-16 sm:py-20 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              The 4 Pillars of Queue Reduction
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
              How VCanteen Solves It Permanently
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pillar 1 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-bold mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  1. Year-Wise Staggered Break Slots
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Instead of releasing all students at once, VCanteen staggers break timings across Years 1 through 4 (e.g. 1st Year: 12:00, 2nd Year: 12:30, 3rd Year: 1:00, 4th Year: 1:30). Each student sees a live countdown timer tuned to their year!
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Distributes 800+ footfall evenly across 2.5 hours</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold mb-4">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  2. QR Gatekeeper & Live Occupancy Caps
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Staff turnstile scanner verifies student roll numbers via webcam. Enforces max capacity limits (default: 100). If the hall is full, it blocks entry with a CANTEEN FULL banner, while students monitor live occupancy meters (green/yellow/red) from their phones!
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Prevents overcrowding & rejects students outside their slot</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold mb-4">
                  <Bike className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  3. Classroom Delivery with 4-Digit OTP
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Students during busy lab sessions can order meals directly to their classroom. Student volunteers accept orders, deliver food, and must input the student’s unique 4-digit OTP to complete delivery. Crucially, classroom deliveries bypass the dining hall and do not count toward canteen capacity!
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% verified handshake with zero reusable OTPs</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold mb-4">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  4. Redressal & VIP Space Pre-Booking
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Complete complaint tracking (Open ➔ Assigned ➔ In Progress ➔ Resolved) with photo upload and staff audit notes. Plus VIP event pre-booking for department parties with double-booking collision prevention algorithms!
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Total transparency & guaranteed table reservation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1-Click Interactive Demo Login Section */}
      <section id="demo-section" className="py-16 sm:py-24 bg-gradient-to-b from-orange-50/50 to-white dark:from-slate-900/60 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              Hackathon Demonstration Mode
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-1">
              Select A Persona to Test
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
              Click any card below to instantly log in with pre-seeded demo accounts and experience all features live.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoPersonas.map((persona) => (
              <div
                key={persona.role}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {persona.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {persona.roll}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${persona.color} text-white flex items-center justify-center font-bold text-lg shadow-md`}>
                      {persona.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        {persona.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {persona.detail}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Can Test:
                    </p>
                    {persona.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleQuickLogin(persona.roll, persona.pass, persona.role)}
                    disabled={loggingInRole !== null}
                    className={`w-full py-3 rounded-2xl bg-gradient-to-r ${persona.color} text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50`}
                  >
                    {loggingInRole === persona.role ? (
                      <span className="animate-pulse">Logging in...</span>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Login as {persona.role}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">VCanteen – Queue Reducer</span>
            <span>• Hackathon Project</span>
          </div>
          <div>
            Built with React (Vite) + Tailwind CSS + Node.js Express + SQLite (better-sqlite3)
          </div>
        </div>
      </footer>
    </div>
  );
}
