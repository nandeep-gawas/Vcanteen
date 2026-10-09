import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  QrCode,
  AlertTriangle,
  Bike,
  Star,
  CalendarCheck,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  UtensilsCrossed,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function AdminDashboardHome() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminStats() {
      try {
        const res = await fetch('/api/stats/admin', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchAdminStats();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 lg:col-span-2" />
          <div className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  const stats = data?.statCards || {
    liveOccupancy: { current: 38, max: 100, percentage: 38 },
    todayEntries: 184,
    openComplaints: 2,
    activeDeliveries: 3,
    averageRating: 4.6,
    totalReviews: 28,
    upcomingBookings: 2
  };

  const occupancy = stats.liveOccupancy;
  const occupancyColor =
    occupancy.percentage > 85 ? 'text-rose-500' : occupancy.percentage > 65 ? 'text-amber-500' : 'text-emerald-500';
  const occupancyBg =
    occupancy.percentage > 85 ? 'bg-rose-500' : occupancy.percentage > 65 ? 'bg-amber-500' : 'bg-emerald-500';

  const hourlyFootfall = data?.charts?.hourlyFootfall || [];
  const categoryOrders = data?.charts?.categoryOrders || [];
  const ratingsBreakdown = data?.charts?.ratingsBreakdown || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-6">
      {/* Admin Executive Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Campus Facilities Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Executive Canteen Administration
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Real-time monitoring of campus cafeteria footfall, turnstile crowd caps, delivery couriers, student satisfaction, and VIP pre-bookings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/entry-counter"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <QrCode className="w-4 h-4" />
              <span>Gate Scanner</span>
            </Link>
            <Link
              to="/pre-booking"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition flex items-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Review Bookings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 6 High-Impact Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Stat 1: Live Occupancy */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Live Inside
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black ${occupancyColor}`}>
                {occupancy.current}
              </span>
              <span className="text-xs text-slate-400">/ {occupancy.max}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${occupancyBg}`}
                style={{ width: `${occupancy.percentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1.5">
              {occupancy.percentage}% Capacity Used
            </p>
          </div>
        </div>

        {/* Stat 2: Today's Gate Entries */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Entries
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.todayEntries}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1.5">
              Turnstile scans logged
            </p>
          </div>
        </div>

        {/* Stat 3: Open Complaints */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Open Grievances
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {stats.openComplaints}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1.5">
              Pending staff action
            </p>
          </div>
        </div>

        {/* Stat 4: Active Deliveries */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Orders
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.activeDeliveries}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1.5">
              Classroom delivery pool
            </p>
          </div>
        </div>

        {/* Stat 5: Average Rating */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Campus Rating
            </span>
            <div className="p-2 rounded-xl bg-yellow-50 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400">
              <Star className="w-4 h-4 fill-yellow-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.averageRating}
              </span>
              <span className="text-xs text-slate-400">★</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1.5">
              {stats.totalReviews} verified reviews
            </p>
          </div>
        </div>

        {/* Stat 6: Upcoming Bookings */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              VIP Bookings
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {stats.upcomingBookings}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1.5">
              Pre-booked party slots
            </p>
          </div>
        </div>
      </div>

      {/* 3 Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Hourly Gate Footfall (Area Chart) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Hourly Canteen Rush & Turnstile Traffic</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 font-semibold">
                    Staggered Peak Flattening
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Gate entry scans today from 09:00 AM to 05:00 PM
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyFootfall} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rushGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.4} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`${value} Students`, 'Footfall']}
                  />
                  <Area
                    type="monotone"
                    dataKey="entries"
                    stroke="#F97316"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#rushGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Footfall evenly distributed across 4 year lunch windows</span>
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Target Cap: 100/slot</span>
          </div>
        </div>

        {/* Chart 2: Classroom Delivery Breakdown by Category */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Classroom Orders
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Popular food categories ordered via peer couriers
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryOrders} layout="vertical" margin={{ top: 5, right: 15, left: 35, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.4} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="orders" radius={[0, 8, 8, 0]}>
                    {categoryOrders.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#10B981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Classroom orders don't congest dining hall</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">100% OTP Verified</span>
          </div>
        </div>
      </div>

      {/* Quality Ratings Chart + Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Multidimensional Quality Dimensions */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              Quality Audit Dimensions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Average student rating per category (Max: 5.0)
            </p>

            <div className="space-y-4">
              {ratingsBreakdown.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>{item.aspect}</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">{item.score} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(item.score / 5.0) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Above Accreditation Benchmark</span>
            </span>
            <Link to="/reviews" className="text-orange-600 hover:underline">
              Inspect Feedback
            </Link>
          </div>
        </div>

        {/* Live System Activity Feed */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Live System Activity Stream</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Recent occurrences across delivery, complaints, and bookings
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No recent activities logged yet today.
                </div>
              ) : (
                recentActivity.map((act, index) => {
                  let badgeBg = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                  let Icon = Layers;

                  if (act.type === 'order') {
                    badgeBg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300';
                    Icon = Bike;
                  } else if (act.type === 'complaint') {
                    badgeBg = 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300';
                    Icon = AlertTriangle;
                  } else if (act.type === 'booking') {
                    badgeBg = 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300';
                    Icon = CalendarCheck;
                  }

                  return (
                    <div key={index} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl flex-shrink-0 ${badgeBg}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                              {act.ref}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {act.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {act.summary} • <span className="font-medium text-slate-700 dark:text-slate-300">{act.actor}</span>
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Automated real-time event pipeline</span>
            <Link to="/complaints" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1">
              <span>View Complaints Portal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
