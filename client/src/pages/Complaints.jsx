import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Video,
  X,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Paperclip,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

import { useToast } from '../context/ToastContext';

export default function Complaints() {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const isStaffOrAdmin = ['staff', 'admin'].includes(user?.role);

  // Tabs: 'my' (Student My Complaints), 'raise' (New Complaint), 'all' (Staff view)
  const [activeTab, setActiveTab] = useState(isStaffOrAdmin ? 'all' : 'raise');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food Quality');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null); // ticket number

  // Complaints List & Filter State
  const [complaints, setComplaints] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Staff list for assignment
  const [staffList, setStaffList] = useState([]);

  // Assignment & Status Update Modal state (for staff/admin)
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'assign' | 'status'
  const [newStatus, setNewStatus] = useState('In Progress');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [staffRemarks, setStaffRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Copy ticket number helper
  const [copiedTicket, setCopiedTicket] = useState(null);

  const categories = ['Food Quality', 'Hygiene', 'Staff', 'Pricing', 'Other'];
  const statusFlow = ['Open', 'Assigned', 'In Progress', 'Resolved'];

  // Handle File Input and preview
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview({ type: 'image', url: reader.result });
      reader.readAsDataURL(selected);
    } else if (selected.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview({ type: 'video', url: reader.result });
      reader.readAsDataURL(selected);
    } else {
      setFilePreview(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  // Submit Complaint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      if (file) {
        formData.append('media', file);
      }

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Submission failed.');
      }

      setSubmitSuccess(json.ticketNumber);
      addToast(`Grievance submitted! Ticket ref: ${json.ticketNumber}`, 'success');
      setTitle('');
      setDescription('');
      setCategory('Food Quality');
      clearFile();
      fetchComplaints();
    } catch (err) {
      addToast(err.message || 'Submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch Complaints
  const fetchComplaints = async () => {
    setLoadingList(true);
    try {
      const endpoint = activeTab === 'all' && isStaffOrAdmin ? '/api/complaints' : '/api/complaints/my';
      const url = new URL(endpoint, window.location.origin);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);
      if (categoryFilter !== 'all') url.searchParams.set('category', categoryFilter);
      if (searchQuery.trim()) url.searchParams.set('search', searchQuery.trim());

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setComplaints(json.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch Staff List for assignment dropdown
  const fetchStaffList = async () => {
    try {
      const res = await fetch('/api/complaints/staff-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setStaffList(json.staff || []);
      }
    } catch (err) {
      console.error('Failed to fetch staff list:', err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    if (isStaffOrAdmin) {
      fetchStaffList();
    }
  }, [activeTab, statusFilter, categoryFilter, token]);

  const handleCopyTicket = (ticket) => {
    navigator.clipboard.writeText(ticket);
    setCopiedTicket(ticket);
    addToast(`Ticket #${ticket} copied to clipboard!`, 'info', 2000);
    setTimeout(() => setCopiedTicket(null), 2000);
  };

  // Staff Assignment Action
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ staff_id: selectedStaffId, remarks: staffRemarks })
      });
      if (res.ok) {
        addToast('Ticket assigned to staff successfully!', 'success');
        setSelectedComplaint(null);
        setStaffRemarks('');
        fetchComplaints();
      } else {
        const err = await res.json();
        addToast(err.message || 'Failed to assign staff.', 'error');
      }
    } catch (err) {
      addToast('Network error while assigning complaint.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Staff Status Flow Action
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!staffRemarks.trim()) {
      addToast('Please enter staff remarks explaining this status change.', 'error');
      return;
    }
    setActionLoading(true);

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, remarks: staffRemarks })
      });
      if (res.ok) {
        addToast(`Ticket status updated to "${newStatus}"!`, 'success');
        setSelectedComplaint(null);
        setStaffRemarks('');
        fetchComplaints();
      } else {
        const err = await res.json();
        addToast(err.message || 'Failed to update status.', 'error');
      }
    } catch (err) {
      addToast('Network error while updating status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Assigned':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Open':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Grievance & Hygiene Redressal
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
              VCanteen Care
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Report queue bottlenecks, food quality concerns, pricing errors, or hygiene issues directly to the supervisor.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl self-start sm:self-auto">
          {!isStaffOrAdmin && (
            <button
              onClick={() => setActiveTab('raise')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'raise'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raise Complaint
            </button>
          )}

          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'my'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Complaints & Tracker
          </button>

          {isStaffOrAdmin && (
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'all'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Campus Complaints (Staff Portal)
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: RAISE COMPLAINT FORM (Student) */}
      {activeTab === 'raise' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          {submitSuccess && (
            <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 animate-in fade-in">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm">Complaint Submitted Successfully!</h3>
                    <p className="text-xs text-emerald-700 mt-1">
                      Your unique tracking ticket is <strong className="font-mono text-emerald-900 text-sm">{submitSuccess}</strong>.
                      Our canteen staff has been notified and will investigate promptly.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('my')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Track in My Complaints
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Complaint Subject / Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lukewarm Sambar served during Year 1 lunch slot"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Attachment (Photo, Video, or Screenshot)
                </label>
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-xl cursor-pointer bg-slate-50 hover:bg-orange-50/40 transition">
                  <Upload className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-slate-600 truncate">
                    {file ? file.name : 'Choose image or video proof'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Live Media Preview before submitting */}
            {filePreview && (
              <div className="relative inline-block rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 p-1">
                {filePreview.type === 'image' ? (
                  <img
                    src={filePreview.url}
                    alt="Complaint Preview"
                    className="max-h-56 max-w-full rounded-xl object-contain"
                  />
                ) : (
                  <video
                    src={filePreview.url}
                    controls
                    className="max-h-56 max-w-full rounded-xl"
                  />
                )}
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Description & Location
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe what occurred, Counter / Table number, timing, and any staff involved..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Submit Ticket</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2 & TAB 3: COMPLAINTS LIST (Search, Filters, and Ticket Tracker Timeline) */}
      {(activeTab === 'my' || activeTab === 'all') && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ticket (e.g. VC-2026), subject, or student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchComplaints()}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2.5 px-3 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="all">All Statuses</option>
                {statusFlow.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-2.5 px-3 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <button
                onClick={fetchComplaints}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Apply
              </button>
            </div>
          </div>

          {/* List Feed */}
          {loadingList ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 bg-slate-200 rounded-3xl"></div>
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500">
              <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-700">No complaints found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search filters or submit a new ticket.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {complaints.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition"
                >
                  {/* Top Bar: Ticket Number & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                        {item.ticket_number}
                        <button
                          onClick={() => handleCopyTicket(item.ticket_number)}
                          className="hover:text-orange-600 transition"
                          title="Copy Ticket"
                        >
                          {copiedTicket === item.ticket_number ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </span>

                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Attached Media */}
                  {item.media_url && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5" />
                        Attached Evidence Proof
                      </span>
                      {item.media_type === 'video' ? (
                        <video
                          src={item.media_url}
                          controls
                          className="max-h-48 rounded-2xl border border-slate-200 bg-black"
                        />
                      ) : (
                        <a
                          href={item.media_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block group"
                        >
                          <img
                            src={item.media_url}
                            alt="Attachment"
                            className="max-h-40 rounded-2xl border border-slate-200 object-cover group-hover:opacity-90 transition shadow-xs"
                          />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Student & Assigned Staff details */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      {item.student_name && (
                        <span>
                          Raised by: <strong className="text-slate-700">{item.student_name}</strong> ({item.student_roll})
                        </span>
                      )}
                      <span>
                        Assigned To:{' '}
                        <strong className="text-slate-800 font-semibold">
                          {item.assigned_to_name ? item.assigned_to_name : 'Unassigned'}
                        </strong>
                      </span>
                    </div>

                    {/* Staff / Admin Actions */}
                    {isStaffOrAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedComplaint(item);
                            setModalAction('assign');
                            setSelectedStaffId(item.assigned_to ? item.assigned_to.toString() : '');
                            setStaffRemarks('');
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700 font-bold text-xs transition"
                        >
                          Assign Staff
                        </button>
                        <button
                          onClick={() => {
                            setSelectedComplaint(item);
                            setModalAction('status');
                            setNewStatus(item.status);
                            setStaffRemarks(item.resolution_notes || '');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition shadow-xs"
                        >
                          Update Status Flow
                        </button>
                      </div>
                    )}
                  </div>

                  {/* TICKET TRACKER TIMELINE (Student & Staff) */}
                  <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50/70 p-4 rounded-2xl">
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                      Ticket Progress Timeline
                    </h4>

                    {/* 4-Step Progress Bar */}
                    <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                      {statusFlow.map((step, idx) => {
                        const currentIdx = statusFlow.indexOf(item.status);
                        const isComplete = idx <= currentIdx;
                        const isCurrent = step === item.status;

                        return (
                          <div key={step} className="flex flex-col items-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                                isComplete
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-500'
                              } ${isCurrent ? 'ring-4 ring-emerald-200' : ''}`}
                            >
                              {idx + 1}
                            </div>
                            <span className={`text-[10px] font-bold mt-1 ${isComplete ? 'text-slate-800' : 'text-slate-400'}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Timeline Remarks Feed */}
                    {item.timeline && item.timeline.length > 0 && (
                      <div className="space-y-2 border-l-2 border-slate-200 ml-3 pl-3 text-xs">
                        {item.timeline.map((entry) => (
                          <div key={entry.id} className="relative">
                            <div className="w-2 h-2 rounded-full bg-orange-500 absolute -left-[17px] top-1"></div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{entry.to_status}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(entry.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                              <span className="text-[10px] text-slate-500">by {entry.author_name}</span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5">{entry.remarks}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Staff Assign Modal */}
      {modalAction === 'assign' && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-900 mb-1">
              Assign Ticket: {selectedComplaint.ticket_number}
            </h2>
            <p className="text-xs text-slate-500 mb-4">{selectedComplaint.title}</p>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Assign Staff Member
                </label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select staff supervisor...</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.branch || s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Assignment Instructions / Remarks
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Inspect Counter 2 valve and coordinate vendor maintenance..."
                  value={staffRemarks}
                  onChange={(e) => setStaffRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAction(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Status Flow Modal */}
      {modalAction === 'status' && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-900 mb-1">
              Update Status: {selectedComplaint.ticket_number}
            </h2>
            <p className="text-xs text-slate-500 mb-4">{selectedComplaint.title}</p>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Next Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {statusFlow.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Staff Remarks (Required for student timeline)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Technician replaced heater coil. Temperature tested at 75°C."
                  value={staffRemarks}
                  onChange={(e) => setStaffRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAction(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
