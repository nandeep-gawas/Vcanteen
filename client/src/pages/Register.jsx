import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  UtensilsCrossed,
  ArrowRight,
  User,
  Hash,
  GraduationCap,
  Building2,
  Lock,
  AlertCircle,
  CheckCircle2,
  Sun,
  Moon,
  Home
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    roll_no: '',
    role: 'student',
    year: '2',
    branch: 'Computer Science',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        roll_no: formData.roll_no,
        role: formData.role,
        password: formData.password,
        year: formData.role === 'student' ? parseInt(formData.year) : null,
        branch: formData.branch
      };

      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/25 mb-3">
          <UtensilsCrossed className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create VCanteen Account
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Join the smart college dining system and skip the long queues
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl border border-slate-100 dark:border-slate-800 sm:px-10">
          {error && (
            <div className="mb-4 flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200/70 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Roll Number / ID
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="roll_no"
                  required
                  placeholder="e.g. 23CSE042 or volunteer1"
                  value={formData.roll_no}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              >
                <option value="student">Student (Customer)</option>
                <option value="volunteer">Volunteer (Delivery Courier)</option>
                <option value="staff">Canteen Staff (Kitchen / Gate)</option>
              </select>
            </div>

            {formData.role === 'student' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Year (1-4)
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="block w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    name="branch"
                    placeholder="e.g. CSE, ECE"
                    value={formData.branch}
                    onChange={handleChange}
                    className="block w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-2xl shadow-lg shadow-orange-500/25 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create VCanteen Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
            <span>Already registered? </span>
            <Link to="/login" className="font-bold text-orange-600 dark:text-orange-400 hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
