import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  BarChart3,
  Sparkles,
  Plus,
  Filter,
  CheckCircle2,
  UtensilsCrossed,
  ChefHat,
  Heart,
  TrendingUp,
  Award,
  ArrowRight,
  Smile,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export default function Reviews() {
  const { user, token } = useAuth();
  const isStaffOrAdmin = ['staff', 'admin'].includes(user?.role);

  // Active Main Tab: 'reviews' | 'suggestions' | 'analytics'
  const [activeTab, setActiveTab] = useState('reviews');

  // ==========================================
  // 1. REVIEWS STATE
  // ==========================================
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Review Form
  const [ratings, setRatings] = useState({
    food_taste: 5,
    hygiene: 5,
    cleanliness: 5,
    staff_behaviour: 5
  });
  const [comment, setComment] = useState('');
  const [foodItem, setFoodItem] = useState('');
  const [chefName, setChefName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Sample dishes & chefs for quick pick
  const popularDishes = [
    'Paneer Tikka Roll',
    'Special Masala Dosa',
    'Veg Grilled Sandwich',
    'Deluxe Veg Thali',
    'Cold Coffee',
    'Cutting Chai',
    'Samosa Plate',
    'Rajma Chawal'
  ];

  const canteenChefs = [
    'Chef Rajan (North Indian & Rolls)',
    'Chef Murugan (South Indian & Dosa)',
    'Chef Anand (Beverages & Snacks)',
    'General Canteen Kitchen'
  ];

  // ==========================================
  // 2. SUGGESTIONS STATE
  // ==========================================
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [suggCategoryFilter, setSuggCategoryFilter] = useState('all');
  const [suggSort, setSuggSort] = useState('upvotes');

  // Suggestion Form
  const [suggTitle, setSuggTitle] = useState('');
  const [suggDesc, setSuggDesc] = useState('');
  const [suggCat, setSuggCat] = useState('Menu Upgrades');
  const [submittingSugg, setSubmittingSugg] = useState(false);

  // ==========================================
  // 3. ANALYTICS STATE (Recharts)
  // ==========================================
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Fetch Reviews
  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch('/api/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setReviews(json.reviews || []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Fetch Suggestions
  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const url = new URL('/api/reviews/suggestions', window.location.origin);
      if (suggCategoryFilter !== 'all') url.searchParams.set('category', suggCategoryFilter);
      url.searchParams.set('sort', suggSort);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setSuggestions(json.suggestions || []);
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Fetch Analytics
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch('/api/reviews/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setAnalytics(json);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews') fetchReviews();
    if (activeTab === 'suggestions') fetchSuggestions();
    if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab, suggCategoryFilter, suggSort, token]);

  // Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewSuccess('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...ratings,
          comment,
          food_item: foodItem,
          chef_name: chefName
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Submission error');

      setReviewSuccess('Review recorded! Thank you for rating today’s dining service.');
      setReviewModalOpen(false);
      setComment('');
      setFoodItem('');
      setChefName('');
      fetchReviews();
      fetchAnalytics();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Submit Suggestion
  const handleSubmitSuggestion = async (e) => {
    e.preventDefault();
    setSubmittingSugg(true);

    try {
      const res = await fetch('/api/reviews/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: suggTitle,
          description: suggDesc,
          category: suggCat
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Submission error');

      setSuggestionModalOpen(false);
      setSuggTitle('');
      setSuggDesc('');
      fetchSuggestions();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingSugg(false);
    }
  };

  // Toggle Upvote
  const handleToggleUpvote = async (suggId) => {
    try {
      const res = await fetch(`/api/reviews/suggestions/${suggId}/upvote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setSuggestions((prev) =>
          prev.map((s) =>
            s.id === suggId
              ? { ...s, upvotes: json.upvotes, has_upvoted: json.hasUpvoted ? 1 : 0 }
              : s
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle upvote:', err);
    }
  };

  // Update Suggestion Status (Staff / Admin)
  const handleUpdateSuggStatus = async (suggId, nextStatus) => {
    try {
      const res = await fetch(`/api/reviews/suggestions/${suggId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchSuggestions();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Star selector helper
  const renderStarInput = (categoryKey, label, icon) => {
    const currentVal = ratings[categoryKey];
    return (
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-800 block">{label}</span>
          <span className="text-[11px] text-slate-400">Rate from 1 to 5 stars</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRatings({ ...ratings, [categoryKey]: star })}
              className="p-1 hover:scale-125 transition transform focus:outline-none"
            >
              <Star
                className={`w-5 h-5 ${
                  star <= currentVal
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-1.5 font-bold font-mono text-xs text-slate-700 w-4 text-center">
            {currentVal}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Reviews & Suggestions
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Food Quality
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rate dining parameters, propose weekly menu upgrades, and review campus satisfaction analytics.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'reviews'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Reviews
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'suggestions'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Suggestions & Upvotes
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Admin Analytics</span>
          </button>
        </div>
      </div>

      {reviewSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{reviewSuccess}</span>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 1: REVIEWS SECTION                     */}
      {/* ========================================== */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              Recent Student Food Reviews
            </h2>

            <button
              onClick={() => setReviewModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Rate Today's Meal
            </button>
          </div>

          {loadingReviews ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-slate-200 rounded-3xl"></div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-500">
              No reviews recorded yet. Be the first to rate today's dishes!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Top: Score & Category Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{rev.overall_rating} / 5.0</span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(rev.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Dish / Chef Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      {rev.food_item && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 border border-orange-200 text-orange-800 flex items-center gap-1">
                          <UtensilsCrossed className="w-3 h-3 text-orange-500" />
                          {rev.food_item}
                        </span>
                      )}
                      {rev.chef_name && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center gap-1">
                          <ChefHat className="w-3 h-3 text-indigo-500" />
                          {rev.chef_name}
                        </span>
                      )}
                    </div>

                    {/* Comment */}
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      "{rev.comment || 'Good food experience.'}"
                    </p>

                    {/* 4 Mini Category Ratings */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-3 border-t border-slate-100 text-[10px] text-slate-600">
                      <div className="p-1.5 rounded-xl bg-slate-50 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Taste</span>
                        <strong className="text-slate-800 font-bold">{rev.food_taste} ⭐</strong>
                      </div>
                      <div className="p-1.5 rounded-xl bg-slate-50 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Hygiene</span>
                        <strong className="text-slate-800 font-bold">{rev.hygiene} ⭐</strong>
                      </div>
                      <div className="p-1.5 rounded-xl bg-slate-50 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Clean</span>
                        <strong className="text-slate-800 font-bold">{rev.cleanliness} ⭐</strong>
                      </div>
                      <div className="p-1.5 rounded-xl bg-slate-50 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Staff</span>
                        <strong className="text-slate-800 font-bold">{rev.staff_behaviour} ⭐</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{rev.reviewer_name} (Yr {rev.reviewer_year || 'N/A'})</span>
                    <span className="font-mono uppercase">{rev.reviewer_roll}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: SUGGESTIONS & UPVOTES               */}
      {/* ========================================== */}
      {activeTab === 'suggestions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Community Suggestions & Menu Upgrades
              </h2>
              <p className="text-xs text-slate-500">Upvote dishes and canteen ideas you would love to see introduced!</p>
            </div>

            <button
              onClick={() => setSuggestionModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Propose Suggestion
            </button>
          </div>

          {/* Filter & Sort Controls */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category:</span>
              <select
                value={suggCategoryFilter}
                onChange={(e) => setSuggCategoryFilter(e.target.value)}
                className="py-1.5 px-3 border border-slate-200 rounded-xl text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="Menu Upgrades">Menu Upgrades</option>
                <option value="Chef Feedback">Chef Feedback</option>
                <option value="New Item Request">New Item Request</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort:</span>
              <select
                value={suggSort}
                onChange={(e) => setSuggSort(e.target.value)}
                className="py-1.5 px-3 border border-slate-200 rounded-xl text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="upvotes">Most Upvoted</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Suggestions Stream */}
          {loadingSuggestions ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-3xl"></div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-500">
              No suggestions in this category yet. Be the first to suggest an idea!
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                        {item.category}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.status === 'Implemented'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : item.status === 'Planned'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : item.status === 'Under Review'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Suggested by {item.author_name}</span>
                      <span>•</span>
                      <span>{new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Upvote Button & Staff Controls */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* Staff status selector */}
                    {isStaffOrAdmin && (
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateSuggStatus(item.id, e.target.value)}
                        className="py-2 px-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 text-slate-700 focus:outline-none"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Planned">Planned</option>
                        <option value="Implemented">Implemented</option>
                      </select>
                    )}

                    {/* Upvote Pill Button */}
                    <button
                      onClick={() => handleToggleUpvote(item.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition transform active:scale-95 ${
                        item.has_upvoted
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${item.has_upvoted ? 'text-white fill-white' : 'text-orange-500'}`} />
                      <span className="font-mono text-sm font-black">{item.upvotes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: ADMIN & RECHARTS ANALYTICS          */}
      {/* ========================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Header Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Canteen Score</span>
                <p className="text-3xl font-black text-slate-900 mt-2 flex items-baseline gap-1">
                  {analytics?.summary?.avg_overall || '4.5'}
                  <span className="text-sm font-normal text-slate-400">/ 5.0</span>
                </p>
              </div>
              <p className="text-xs text-emerald-600 font-bold mt-2">
                ⭐ Excellent Dining Rating
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Reviews</span>
                <p className="text-3xl font-black text-slate-900 mt-2">
                  {analytics?.summary?.total_reviews || 0}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Across 4 student academic batches
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hygiene & Cleanliness</span>
                <p className="text-3xl font-black text-emerald-600 mt-2">
                  {analytics?.summary?.avg_hygiene || '4.4'} / 5.0
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Audit compliant with campus standards
              </p>
            </div>
          </div>

          {/* Recharts Bar Chart: Average Rating per Category */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Rating Breakdown by Category
                </h3>
                <p className="text-xs text-slate-500">
                  Average student score on a 1.0 to 5.0 scale
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Recharts Visualizer
              </span>
            </div>

            <div className="h-72 w-full">
              {analytics?.chartData && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="category"
                      tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '1rem',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        padding: '10px 14px'
                      }}
                      formatter={(val) => [`${val} / 5.0`, 'Rating']}
                    />
                    <Bar dataKey="rating" radius={[10, 10, 0, 0]} barSize={48}>
                      {analytics.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Rated Food Items */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-500" />
              Most Reviewed Campus Dishes
            </h3>

            {analytics?.topDishes && analytics.topDishes.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {analytics.topDishes.map((dish, i) => (
                  <div key={i} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">
                        #{i + 1}
                      </span>
                      <span className="font-bold text-sm text-slate-800">{dish.food_item}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">{dish.count} reviews</span>
                      <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                        {dish.avg_taste} ⭐ taste
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Reviews with dish tags will show up here.</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: SUBMIT MULTI-CATEGORY REVIEW        */}
      {/* ========================================== */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black text-slate-900 mb-1">
              Rate Today's Dining Experience
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Multi-category review to help canteen supervisors audit quality.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Inputs */}
              <div className="space-y-2.5">
                {renderStarInput('food_taste', '1. Food Taste & Freshness')}
                {renderStarInput('hygiene', '2. Food Prep Hygiene')}
                {renderStarInput('cleanliness', '3. Dining Hall Cleanliness')}
                {renderStarInput('staff_behaviour', '4. Counter Staff Behaviour')}
              </div>

              {/* Dish picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Menu Item (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paneer Tikka Roll, Masala Dosa..."
                  value={foodItem}
                  onChange={(e) => setFoodItem(e.target.value)}
                  list="dishes-datalist"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <datalist id="dishes-datalist">
                  {popularDishes.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>

              {/* Chef picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Chef / Station (Optional)
                </label>
                <select
                  value={chefName}
                  onChange={(e) => setChefName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select chef or kitchen station...</option>
                  {canteenChefs.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Comments & Feedback
                </label>
                <textarea
                  rows={3}
                  placeholder="What was great? What could be improved?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: SUBMIT SUGGESTION                   */}
      {/* ========================================== */}
      {suggestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6">
            <h2 className="text-xl font-black text-slate-900 mb-1">
              Propose a Campus Suggestion
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Fellow students can upvote your idea to get it fast-tracked by canteen management.
            </p>

            <form onSubmit={handleSubmitSuggestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category
                </label>
                <select
                  value={suggCat}
                  onChange={(e) => setSuggCat(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Menu Upgrades">Menu Upgrades</option>
                  <option value="Chef Feedback">Chef Feedback</option>
                  <option value="New Item Request">New Item Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Suggestion Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Add Fresh Smoothie Bar for morning slots"
                  value={suggTitle}
                  onChange={(e) => setSuggTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Why is this needed? (Description)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain how this improves dining or speeds up queue flow..."
                  value={suggDesc}
                  onChange={(e) => setSuggDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSuggestionModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSugg}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                >
                  {submittingSugg ? 'Submitting...' : 'Post Suggestion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
