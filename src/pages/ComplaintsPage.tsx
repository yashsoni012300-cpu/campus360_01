import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning,
  Plus,
  Send,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
  User,
  Trash2,
  Edit3,
  X,
  FileCheck,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { Complaint } from '../types/index.ts';

export const ComplaintsPage: React.FC = () => {
  const { user, isAdmin, authFetch } = useAuth();
  const { success, error } = useToast();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Submit Complaint Form State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    category: 'Infrastructure',
    subject: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Admin Status Update Modal
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminStatus, setAdminStatus] = useState<'Open' | 'In Progress' | 'Resolved'>('In Progress');
  const [adminRemark, setAdminRemark] = useState<string>('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (categoryFilter !== 'All') params.append('category', categoryFilter);

      const res = await authFetch(`/api/complaints?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (err) {
      error('Failed to load grievance tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subject.trim().length < 5) {
      error('Subject must be at least 5 characters long.');
      return;
    }
    if (formData.description.trim().length < 10) {
      error('Please provide a detailed description (min 10 characters).');
      return;
    }

    try {
      setSubmitting(true);
      const res = await authFetch('/api/complaints', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        success(data.message);
        setIsSubmitModalOpen(false);
        setFormData({ category: 'Infrastructure', subject: '', description: '' });
        fetchComplaints();
      } else {
        error(data.message);
      }
    } catch (err) {
      error('Failed to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenStatusModal = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setAdminStatus(comp.status);
    setAdminRemark(comp.adminRemark || '');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      const res = await authFetch(`/api/complaints/${selectedComplaint.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: adminStatus,
          adminRemark: adminRemark.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        success(data.message);
        setStatusModalOpen(false);
        fetchComplaints();
      } else {
        error(data.message);
      }
    } catch (err) {
      error('Failed to update status.');
    }
  };

  const handleDelete = async (comp: Complaint) => {
    if (!confirm('Are you sure you want to delete this grievance ticket?')) return;
    try {
      const res = await authFetch(`/api/complaints/${comp.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success('Ticket removed.');
        fetchComplaints();
      } else {
        error(data.message);
      }
    } catch (err) {
      error('Failed to delete ticket.');
    }
  };

  const getStatusBadge = (status: 'Open' | 'In Progress' | 'Resolved') => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Clock className="w-3.5 h-3.5" /> In Progress
          </span>
        );
      case 'Open':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" /> Open Ticket
          </span>
        );
    }
  };

  const openCount = complaints.filter(c => c.status === 'Open').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header and Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <MessageSquareWarning className="w-4 h-4" />
            <span>Digital Grievance & Student Redressal Cell</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Complaints, Feedback & Grievances
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Submit issues concerning labs, attendance reconciliation, library Wi-Fi, or faculty queries with auditable lifecycle tracking.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Submit New Grievance
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-400 uppercase font-bold">Open Tickets</span>
            <p className="text-2xl font-extrabold text-white mt-0.5">{openCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-sky-400 uppercase font-bold">In Progress</span>
            <p className="text-2xl font-extrabold text-white mt-0.5">{inProgressCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400 uppercase font-bold">Resolved Tickets</span>
            <p className="text-2xl font-extrabold text-white mt-0.5">{resolvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['All', 'Open', 'In Progress', 'Resolved'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Library">Library</option>
            <option value="Hostel">Hostel</option>
            <option value="Canteen">Canteen</option>
            <option value="Examination">Examination</option>
            <option value="IT Support">IT Support</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading grievance records...</div>
      ) : complaints.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-300 font-medium">No complaints or grievances found.</p>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="text-xs text-indigo-400 hover:underline font-semibold"
          >
            Submit your feedback or report an issue &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map(comp => (
            <div
              key={comp.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-3"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(comp.status)}
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700">
                    {comp.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Ticket ID: #{comp.id.slice(-6).toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-mono text-[11px]">
                    Filed: {new Date(comp.createdAt).toLocaleDateString()}
                  </span>

                  {isAdmin && (
                    <button
                      onClick={() => handleOpenStatusModal(comp)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3 h-3" /> Update Status
                    </button>
                  )}

                  {(isAdmin || comp.studentId === user?.id) && (
                    <button
                      onClick={() => handleDelete(comp)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete ticket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-bold text-white mb-1.5">{comp.subject}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{comp.description}</p>
              </div>

              {/* User meta (visible especially for admin) */}
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  Submitted by: <strong className="text-slate-200">{comp.studentName}</strong> ({comp.studentEmail} {comp.enrollmentNo ? `&bull; ${comp.enrollmentNo}` : ''})
                </span>
              </div>

              {/* Administrative Resolution Remark */}
              {comp.adminRemark && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/25 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                    <span className="flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      Administrative Action & Resolution Note
                    </span>
                    {comp.resolvedAt && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Resolved: {new Date(comp.resolvedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{comp.adminRemark}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submit Grievance Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Submit Grievance / Feedback Ticket</h3>
            <p className="text-xs text-slate-400 mb-5">
              Direct escalation to Silver Oak University Administration & Department Guides
            </p>

            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Issue Category *</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Academic">Academic (Lectures, Syllabus, Lab Assignments)</option>
                  <option value="Infrastructure">Infrastructure (Classrooms, Projectors, Air-Conditioning)</option>
                  <option value="Library">Library Resources & Wi-Fi Access</option>
                  <option value="Hostel">Hostel & Accommodation</option>
                  <option value="Canteen">Campus Canteen & Hygiene</option>
                  <option value="Examination">Examination & Hall Ticket Queries</option>
                  <option value="IT Support">IT Support & Smart Campus Login</option>
                  <option value="Other">Other University Inquiries</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject / Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wi-Fi disconnection in Computer Lab 4"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the issue clearly, including time, location, or faculty batch if applicable..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting...' : 'Register Grievance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Status Changer Modal */}
      {statusModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Review & Resolve Grievance Ticket</h3>
            <p className="text-xs text-slate-400 mb-4">
              Student: <strong className="text-white">{selectedComplaint.studentName}</strong> &bull; {selectedComplaint.subject}
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Update Ticket Status *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Open', 'In Progress', 'Resolved'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAdminStatus(st)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                        adminStatus === st
                          ? st === 'Resolved'
                            ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                            : st === 'In Progress'
                            ? 'border-sky-500/50 bg-sky-500/20 text-sky-300'
                            : 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Administrative Remark / Action Taken</label>
                <textarea
                  rows={4}
                  placeholder="Explain actions taken by department, technician dispatch details, or resolution remarks..."
                  value={adminRemark}
                  onChange={e => setAdminRemark(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
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
};
