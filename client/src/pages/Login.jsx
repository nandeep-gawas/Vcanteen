import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  UtensilsCrossed,
  ArrowRight,
  Shield,
  User,
  Bike,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Sun,
  Moon,
  Home
} from 'lucide-react';

export default function Login() {
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(rollNo, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRoll, demoPass) => {
    setRollNo(demoRoll);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      await login(demoRoll, demoPass);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-slate-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors relative">
      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Link
          to="/"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
          title="Return to Home"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800 transition"
          title="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/25 mb-4 transform hover:scale-105 transition">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          VCanteen
        </h1>
        <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 inline-block px-3 py-0.5 rounded-full">
          Queue Reducer & Dining Flow
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Sign in with your campus roll number or staff ID
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Demo Fast Login Cards */}
        <div className="mb-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-2xl p-4 border border-orange-100/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1-Click Demo Logins
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Tap to auto-fill & login</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('student1', 'pass123')}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-slate-800/80 transition text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-none group-hover:text-orange-600">Student</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">student1</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('volunteer1', 'pass123')}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-slate-800/80 transition text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Bike className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-none group-hover:text-emerald-600">Volunteer</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">volunteer1</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('staff1', 'pass123')}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 transition text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-none group-hover:text-indigo-600">Staff</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">staff1</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin', 'admin123')}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-rose-500 dark:hover:border-rose-500 hover:bg-rose-50/50 dark:hover:bg-slate-800/80 transition text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-none group-hover:text-rose-600">Admin</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">admin</p>
              </div>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl border border-slate-100 dark:border-slate-800 sm:px-10">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200/70 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Roll Number / User ID
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. student1, staff1, admin"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-orange-500/25 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to VCanteen</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            <span>New student or staff? </span>
            <Link to="/register" className="font-bold text-orange-600 dark:text-orange-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
