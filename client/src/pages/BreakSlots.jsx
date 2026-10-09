import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Users,
  Shield,
  Layers,
  ArrowRight,
  Sliders
} from 'lucide-react';
import StudentBreakCountdown from '../components/StudentBreakCountdown';

export default function BreakSlots() {
  const { user, token } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state for Admin Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    slot_name: '',
    target_year: '1',
    start_time: '12:00',
    end_time: '12:30',
    max_capacity: '100',
    is_active: true
  });

  // Capacity admin setting
  const [maxCapacitySetting, setMaxCapacitySetting] = useState('100');
  const [updatingCapacity, setUpdatingCapacity] = useState(false);

  const fetchSlots = async () => {
    try {
      const res = await fetch('/api/slots', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      setError('Unable to load break timetable.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCapacity = async () => {
    try {
      const res = await fetch('/api/gate/occupancy');
      if (res.ok) {
        const data = await res.json();
        setMaxCapacitySetting(data.maxCapacity.toString());
      }
    } catch (err) {
      console.error('Failed to fetch capacity:', err);
    }
  };

  useEffect(() => {
    fetchSlots();
    fetchCapacity();
  }, [token]);

  const handleOpenCreate = () => {
    setEditingSlot(null);
    setFormData({
      slot_name: '',
      target_year: '1',
      start_time: '12:00',
      end_time: '12:30',
      max_capacity: '100',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      slot_name: slot.slot_name,
      target_year: slot.target_year ? slot.target_year.toString() : '',
      start_time: slot.start_time,
      end_time: slot.end_time,
      max_capacity: slot.max_capacity.toString(),
      is_active: !!slot.is_active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this break slot?')) return;
    try {
      const res = await fetch(`/api/slots/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess('Slot removed successfully.');
        fetchSlots();
      } else {
        const err = await res.json();
        setError(err.message || 'Failed to delete slot.');
      }
    } catch (err) {
      setError('Network error while deleting slot.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingSlot ? `/api/slots/${editingSlot.id}` : '/api/slots';
      const method = editingSlot ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Error saving slot.');
      }

      setSuccess(editingSlot ? 'Slot updated successfully!' : 'New break slot added!');
      setIsModalOpen(false);
      fetchSlots();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveCapacity = async () => {
    setUpdatingCapacity(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/gate/capacity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ maxCapacity: maxCapacitySetting })
      });
      if (res.ok) {
        setSuccess(`Canteen max capacity updated to ${maxCapacitySetting}.`);
      } else {
        const err = await res.json();
        setError(err.message || 'Failed to update capacity.');
      }
    } catch (err) {
      setError('Network error saving capacity.');
    } finally {
      setUpdatingCapacity(false);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Year-Wise Break Timing
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
              Queue Reducer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Staggered schedule designed to divide 2,000+ campus students across allocated lunch batches.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create Break Slot
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Student Personal Countdown View if student */}
      {isStudent && user?.year && (
        <div>
          <StudentBreakCountdown token={token} userYear={user.year} />
        </div>
      )}

      {/* Admin Capacity Control Strip */}
      {isAdmin && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Canteen Max Capacity Setting</h3>
              <p className="text-xs text-slate-500">
                Gate turnstiles automatically block entry once active students inside reach this threshold.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="number"
                min="10"
                max="1000"
                value={maxCapacitySetting}
                onChange={(e) => setMaxCapacitySetting(e.target.value)}
                className="w-24 px-3 py-2 text-sm font-bold font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
              />
              <span className="text-[10px] text-slate-400 block text-center mt-0.5">seats limit</span>
            </div>
            <button
              onClick={handleSaveCapacity}
              disabled={updatingCapacity}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-60"
            >
              {updatingCapacity ? 'Saving...' : 'Update Limit'}
            </button>
          </div>
        </div>
      )}

      {/* Master Campus Timetable Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            Master Campus Break Timetable
          </h2>
          <span className="text-xs text-slate-400">All Batches</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-slate-200 rounded-3xl"></div>
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-500">
            No break slots configured yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => {
              const isUserSlot = isStudent && user?.year === slot.target_year;
              const isLive = slot.status === 'active';

              return (
                <div
                  key={slot.id}
                  className={`relative flex flex-col justify-between p-5 rounded-3xl border transition-all duration-200 shadow-xs ${
                    isLive
                      ? 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border-emerald-300 ring-2 ring-emerald-500/20'
                      : isUserSlot
                      ? 'bg-gradient-to-br from-orange-50/70 via-white to-amber-50/50 border-orange-300'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {slot.target_year ? `Year ${slot.target_year}` : 'Open / All Years'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isLive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                            Active Now
                          </span>
                        )}
                        {isUserSlot && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                            Your Slot
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">
                      {slot.slot_name}
                    </h3>

                    {/* Timing */}
                    <div className="mt-3 flex items-center gap-2 font-mono text-xl font-black text-slate-800">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>{slot.start_time} - {slot.end_time}</span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {slot.label}
                    </p>
                  </div>

                  {/* Footer & Admin Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Max {slot.max_capacity} Seats
                    </span>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(slot)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition"
                          title="Edit Slot"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 overflow-hidden">
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">
              {editingSlot ? 'Edit Break Slot' : 'Create Year Break Slot'}
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Set the designated time window and year batch for canteen entry.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Slot Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1st Year Lunch Break"
                  value={formData.slot_name}
                  onChange={(e) => setFormData({ ...formData, slot_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Target Academic Year
                  </label>
                  <select
                    value={formData.target_year}
                    onChange={(e) => setFormData({ ...formData, target_year: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="">General / All Years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Slot Max Capacity
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="500"
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Start Time (24h)
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    End Time (24h)
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition"
                >
                  {editingSlot ? 'Save Changes' : 'Create Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
