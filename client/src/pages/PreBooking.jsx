import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  PartyPopper,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  MessageSquare,
  Lock,
  Plus
} from 'lucide-react';

import { useToast } from '../context/ToastContext';

export default function PreBooking() {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const isAdminOrStaff = ['admin', 'staff'].includes(user?.role);

  // Tab: 'book' | 'my-bookings' | 'admin-requests'
  const [activeTab, setActiveTab] = useState(isAdminOrStaff ? 'admin-requests' : 'book');

  // Form state
  const [eventType, setEventType] = useState('Birthday Celebration');
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('03:30 PM - 05:00 PM');
  const [guestCount, setGuestCount] = useState('20');
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Available slots for selected date
  const [availableSlots, setAvailableSlots] = useState([]);
  const [checkingSlots, setCheckingSlots] = useState(false);

  // Bookings list state
  const [myBookings, setMyBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Admin Review Modal state
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const eventTypes = [
    'Birthday Celebration',
    'Club / Dept Gathering',
    'Batch Meetup & Farewell',
    'Cultural Team Gathering',
    'Faculty / Project Celebration',
    'Other'
  ];

  // Fetch slot availability for selected date
  const fetchAvailableSlots = async (date) => {
    if (!date) return;
    setCheckingSlots(true);
    try {
      const res = await fetch(`/api/party/available-slots?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setAvailableSlots(json.slots || []);
      }
    } catch (err) {
      console.error('Failed to check available slots:', err);
    } finally {
      setCheckingSlots(false);
    }
  };

  // Fetch Student's Bookings
  const fetchMyBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch('/api/party/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setMyBookings(json.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch All Bookings (Admin/Staff)
  const fetchAllBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch('/api/party/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setAllBookings(json.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load all bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (bookingDate) {
      fetchAvailableSlots(bookingDate);
    }
  }, [bookingDate, token]);

  useEffect(() => {
    if (token) {
      if (activeTab === 'my-bookings') fetchMyBookings();
      if (activeTab === 'admin-requests') fetchAllBookings();
    }
  }, [activeTab, token]);

  // Submit Pre-booking
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess('');
    setSubmitError('');

    try {
      const res = await fetch('/api/party/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          event_type: eventType,
          booking_date: bookingDate,
          time_slot: timeSlot,
          guest_count: guestCount,
          special_requests: specialRequests
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Booking submission failed.');
      }

      setSubmitSuccess(`Party pre-booking request submitted! Tracking reference: ${json.bookingNumber}`);
      addToast(`Booking submitted! Tracking ref: ${json.bookingNumber}`, 'success');
      setSpecialRequests('');
      fetchAvailableSlots(bookingDate);
      fetchMyBookings();
    } catch (err) {
      setSubmitError(err.message);
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Admin Review Submit (Approve / Reject)
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!adminNotes.trim()) {
      addToast('Please provide an administrative reason or setup notes.', 'error');
      return;
    }

    setReviewLoading(true);
    try {
      const res = await fetch(`/api/party/bookings/${reviewBooking.id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: reviewStatus,
          admin_notes: adminNotes.trim()
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to review booking.');

      addToast(`Booking has been ${reviewStatus.toLowerCase()} successfully!`, 'success');
      setReviewBooking(null);
      setAdminNotes('');
      fetchAllBookings();
      fetchAvailableSlots(bookingDate);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Party & Event Pre-Booking
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Canteen Reservation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reserve the canteen dining section for student birthdays, departmental gatherings, or club celebrations.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'book'
                ? 'bg-white text-purple-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Book Event
          </button>

          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'my-bookings'
                ? 'bg-white text-purple-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Reservations
          </button>

          {isAdminOrStaff && (
            <button
              onClick={() => setActiveTab('admin-requests')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'admin-requests'
                  ? 'bg-white text-purple-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Review Requests</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* TAB 1: PRE-BOOKING FORM (Student)          */}
      {/* ========================================== */}
      {activeTab === 'book' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          {submitSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{submitSuccess}</span>
              </div>
              <button
                onClick={() => setActiveTab('my-bookings')}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold"
              >
                Track Status
              </button>
            </div>
          )}

          {submitError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Event Occasion / Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  Booking Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>
            </div>

            {/* Time Slot Selector with Live Double-Booking Prevention */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  Select Reserved Time Window (Single Event per Slot)
                </label>
                <span className="text-[11px] text-slate-400">
                  {checkingSlots ? 'Checking availability...' : 'Double booking prevented'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableSlots.map((slot) => {
                  const isSelected = timeSlot === slot.time_slot;
                  const isTaken = slot.isBooked;

                  return (
                    <button
                      key={slot.time_slot}
                      type="button"
                      disabled={isTaken}
                      onClick={() => setTimeSlot(slot.time_slot)}
                      className={`p-3.5 rounded-2xl border text-left transition relative ${
                        isTaken
                          ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black">{slot.time_slot}</span>
                        {isTaken ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            Reserved
                          </span>
                        ) : isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-purple-600" />
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            Available
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  Estimated Guests (5 - 100)
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={100}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reserved Dining Section
                </label>
                <div className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-600 font-medium">
                  Canteen Garden Terrace / Circular Section
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Special Requests & Setup Needs
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Birthday cake cutting table, sound speaker access for playlist, 24 complimentary drinking glasses..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-purple-600/20 flex items-center justify-center gap-2"
            >
              {submitting ? 'Submitting Reservation...' : 'Submit Party Pre-Booking for Approval'}
            </button>
          </form>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: MY BOOKINGS & APPROVAL STATUS       */}
      {/* ========================================== */}
      {activeTab === 'my-bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PartyPopper className="w-4 h-4 text-purple-600" />
              My Party Reservations & Status
            </h2>
            <button
              onClick={fetchMyBookings}
              className="text-xs text-purple-600 font-bold hover:underline"
            >
              Refresh
            </button>
          </div>

          {loadingBookings ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-36 bg-slate-200 rounded-3xl"></div>
              ))}
            </div>
          ) : myBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-500">
              <PartyPopper className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-700">No party bookings submitted yet</p>
              <button
                onClick={() => setActiveTab('book')}
                className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
              >
                Pre-Book an Event
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
                        {b.booking_number}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{b.event_type}</span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusBadge(b.status)}`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Event Date</span>
                      <strong className="text-slate-900 font-mono">{b.booking_date}</strong>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Reserved Time Slot</span>
                      <strong className="text-slate-900 font-mono">{b.time_slot}</strong>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Guests</span>
                      <strong className="text-slate-900">{b.guest_count} People</strong>
                    </div>
                  </div>

                  {b.special_requests && (
                    <div className="mt-3 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-2xl">
                      <span className="font-bold text-slate-700">Special Requests: </span>
                      {b.special_requests}
                    </div>
                  )}

                  {/* Admin Feedback / Approval Reason */}
                  {b.admin_notes && (
                    <div className={`mt-3 p-3.5 rounded-2xl text-xs ${
                      b.status === 'Approved'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                        : 'bg-red-50 border border-red-200 text-red-900'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        {b.status === 'Approved' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span>Administration Decision Notes ({b.reviewer_name || 'Dean Office'}):</span>
                      </div>
                      <p className="leading-relaxed font-medium pl-5">{b.admin_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: ADMIN REQUESTS & APPROVAL PORTAL    */}
      {/* ========================================== */}
      {activeTab === 'admin-requests' && isAdminOrStaff && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Party Pre-Booking Review Portal
            </h2>
            <button
              onClick={fetchAllBookings}
              className="text-xs text-purple-600 font-bold hover:underline"
            >
              Refresh
            </button>
          </div>

          {loadingBookings ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-slate-200 rounded-3xl"></div>
              ))}
            </div>
          ) : allBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-500">
              No party booking requests found.
            </div>
          ) : (
            <div className="space-y-4">
              {allBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
                        {b.booking_number}
                      </span>
                      <span className="font-bold text-sm text-slate-900">{b.event_type}</span>
                      <span className="text-xs text-slate-500">• {b.student_name} ({b.student_roll.toUpperCase()} • Yr {b.student_year})</span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusBadge(b.status)}`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 text-xs text-slate-600">
                      <p>
                        Date: <strong className="font-mono text-slate-900">{b.booking_date}</strong> • Slot: <strong className="font-mono text-slate-900">{b.time_slot}</strong>
                      </p>
                      <p>
                        Guests: <strong className="text-slate-900">{b.guest_count} People</strong>
                      </p>
                      {b.special_requests && (
                        <p className="text-slate-500 italic">"{b.special_requests}"</p>
                      )}
                      {b.admin_notes && (
                        <p className="text-purple-700 font-semibold mt-1">Admin Notes: {b.admin_notes}</p>
                      )}
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => {
                          setReviewBooking(b);
                          setReviewStatus('Approved');
                          setAdminNotes('Tables 14-16 reserved in terrace section.');
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setReviewBooking(b);
                          setReviewStatus('Rejected');
                          setAdminNotes('Canteen maintenance scheduled during this window.');
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-900 mb-1">
              Review Party Booking: {reviewBooking.booking_number}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {reviewBooking.event_type} on {reviewBooking.booking_date} ({reviewBooking.time_slot})
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('Approved')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      reviewStatus === 'Approved'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Approve Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus('Rejected')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      reviewStatus === 'Rejected'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Reject Request
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {reviewStatus === 'Approved' ? 'Reserved Table Setup Instructions' : 'Rejection Reason'}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={
                    reviewStatus === 'Approved'
                      ? 'e.g. Tables 14-16 reserved in terrace area. Sound box authorized.'
                      : 'e.g. Slot already occupied by campus staff conference.'
                  }
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className={`px-5 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition ${
                    reviewStatus === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm {reviewStatus}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
