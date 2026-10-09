import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import WalletModal from './WalletModal';
import {
  UtensilsCrossed,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  Sparkles,
  Bike,
  Sun,
  Moon,
  Home,
  Coins
} from 'lucide-react';

export default function Navbar({ mobileMenuOpen, setMobileMenuOpen }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [walletOpen, setWalletOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/50',
          icon: Shield
        };
      case 'staff':
        return {
          label: 'Canteen Staff',
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/50',
          icon: Sparkles
        };
      case 'volunteer':
        return {
          label: 'Volunteer',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50',
          icon: Bike
        };
      case 'student':
      default:
        return {
          label: 'Student',
          color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/50',
          icon: User
        };
    }
  };

  const badge = user ? getRoleBadge(user.role) : null;
  const RoleIcon = badge ? badge.icon : User;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  VCanteen
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 hidden sm:inline-block">
                    Queue Reducer
                  </span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                  Smart College Dining
                </span>
              </div>
            </Link>

            {/* Quick Landing Page Link */}
            <Link
              to="/"
              className="hidden md:flex items-center gap-1.5 ml-4 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition"
              title="Return to Landing Page"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Overview</span>
            </Link>
          </div>

          {/* Right: Actions, Notifications, Theme, User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {user ? (
              <>
                {/* Campus Coins Wallet Pill */}
                <button
                  type="button"
                  onClick={() => setWalletOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition text-xs font-bold"
                  title="Campus Coins Wallet: Click to view ledger & balance"
                >
                  <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-mono">{user.coin_balance ?? 0}</span>
                  <span className="hidden md:inline text-[11px] font-semibold text-amber-700/80 dark:text-amber-400/80">Coins</span>
                </button>

                {/* Notification Bell */}
                <NotificationBell />

                {/* Role Pill */}
                <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                  <RoleIcon className="w-3.5 h-3.5" />
                  <span>{badge.label}</span>
                </div>

                {/* User avatar/name chip */}
                <div className="flex items-center gap-2.5 pl-2 py-1">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-emerald-500 text-white font-bold text-sm flex items-center justify-center shadow-inner">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                      {user.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {user.roll_no.toUpperCase()}
                      {user.branch ? ` • ${user.branch}` : ''}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-100 dark:hover:border-red-900/40 transition flex items-center gap-1.5 text-xs font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>

                <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition shadow-sm shadow-orange-500/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
