import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Clock,
  QrCode,
  AlertTriangle,
  Star,
  CalendarCheck,
  Bike,
  Sparkles,
  Users,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const { user } = useAuth();

  // Navigation Items with role-specific indicators
  const navItems = [
    {
      name: 'Overview Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: 'Main',
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    },
    {
      name: 'Break Slots',
      path: '/break-slots',
      icon: Clock,
      badge: 'Queue Reducer',
      badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
    },
    {
      name: 'Pre-Booking',
      path: '/pre-booking',
      icon: CalendarCheck,
      badge: 'VIP Booking',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
    },
    {
      name: 'Classroom Delivery',
      path: '/classroom-delivery',
      icon: Bike,
      badge: 'Peer Courier',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
    },
    {
      name: 'Entry Counter',
      path: '/entry-counter',
      icon: QrCode,
      badge: 'Staff / Admin',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
    },
    {
      name: 'Complaints',
      path: '/complaints',
      icon: AlertTriangle,
      badge: 'Redressal',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
    },
    {
      name: 'Reviews & Feedback',
      path: '/reviews',
      icon: Star,
      badge: 'Ratings',
      badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300'
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Current User Quick Context Card */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50/50 to-emerald-50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-800/30 border border-orange-100/80 dark:border-slate-700/60 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-base">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Logged in as</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name || 'User'}</p>
          </div>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-orange-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 uppercase font-mono font-medium">{user?.roll_no}</span>
          <span className="capitalize px-2 py-0.5 rounded-full font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-2xs">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Navigation Modules
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-500'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-tight transition ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">VCanteen Core API v1</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 leading-snug">
          Designed to reduce peak lunch break lines by up to 74%.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-20">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Slide-out Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl z-50 animate-in slide-in-from-left duration-300">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
