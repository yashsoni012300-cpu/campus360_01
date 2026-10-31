import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  Calculator,
  User as UserIcon,
  BookOpen,
  X,
  Search,
  Sparkles,
  TrendingUp,
  Percent
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { AttendanceRecord, User } from '../types/index.ts';

export const AttendancePage: React.FC = () => {
  const { user, isAdmin, authFetch } = useAuth();
  const { success, error } = useToast();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    subjectCode: '',
    subjectName: '',
    attendedClasses: 35,
    totalClasses: 42,
    facultyName: '',
    semester: 6
  });

  // Fetch attendance records
  const fetchAttendance = async (studentId?: string) => {
    try {
      setLoading(true);
      let url = '/api/attendance';
      if (isAdmin && studentId) {
        url += `?studentId=${studentId}`;
      }
      const res = await authFetch(url);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      }
    } catch (err) {
      error('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch student list for admin
  useEffect(() => {
    if (isAdmin) {
      authFetch('/api/students')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStudents(data.data);
            if (data.data.length > 0 && !selectedStudentId) {
              setSelectedStudentId(data.data[0].id);
              fetchAttendance(data.data[0].id);
            } else {
              fetchAttendance();
            }
          }
        })
        .catch(() => error('Failed to load student directory.'));
    } else {
      fetchAttendance();
    }
  }, [isAdmin]);

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    fetchAttendance(id);
  };

  // Calculate required classes to reach 75%
  // Formula: (attended + x) / (total + x) >= 0.75  =>  attended + x >= 0.75*total + 0.75*x  =>  0.25*x >= 0.75*total - attended  =>  x >= (3*total - 4*attended)
  const calculateRequiredClasses = (attended: number, total: number): number => {
    const currentPct = total > 0 ? (attended / total) * 100 : 0;
    if (currentPct >= 75) return 0;
    const required = Math.ceil((3 * total - 4 * attended));
    return Math.max(0, required);
  };

  // Aggregate stats
  let totalAttended = 0;
  let totalClasses = 0;
  records.forEach(r => {
    totalAttended += r.attendedClasses;
    totalClasses += r.totalClasses;
  });
  const aggregatePct = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
  const shortageCount = records.filter(r => {
    const pct = r.totalClasses > 0 ? (r.attendedClasses / r.totalClasses) * 100 : 0;
    return pct < 75;
  }).length;

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      studentId: selectedStudentId || (students[0]?.id || ''),
      subjectCode: '',
      subjectName: '',
      attendedClasses: 35,
      totalClasses: 42,
      facultyName: 'Prof. Faculty Member',
      semester: 6
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setFormData({
      studentId: rec.studentId,
      subjectCode: rec.subjectCode,
      subjectName: rec.subjectName,
      attendedClasses: rec.attendedClasses,
      totalClasses: rec.totalClasses,
      facultyName: rec.facultyName,
      semester: rec.semester
    });
    setIsModalOpen(true);
  };

  // Save record (Add or Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.attendedClasses > formData.totalClasses) {
      error('Attended classes cannot exceed total classes.');
      return;
    }

    try {
      if (editingRecord) {
        // Edit
        const res = await authFetch(`/api/attendance/${editingRecord.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          success('Attendance record updated successfully.');
          setIsModalOpen(false);
          fetchAttendance(selectedStudentId);
        } else {
          error(data.message);
        }
      } else {
        // Add
        const res = await authFetch('/api/attendance', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          success('Attendance record added.');
          setIsModalOpen(false);
          fetchAttendance(selectedStudentId);
        } else {
          error(data.message);
        }
      }
    } catch (err) {
      error('Failed to save attendance record.');
    }
  };

  // Delete record
  const handleDelete = async (id: string, subName: string) => {
    if (!confirm(`Are you sure you want to remove attendance for "${subName}"?`)) return;
    try {
      const res = await authFetch(`/api/attendance/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success('Record deleted.');
        fetchAttendance(selectedStudentId);
      } else {
        error(data.message);
      }
    } catch (err) {
      error('Failed to delete attendance record.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>Academic Registry &bull; Semester 6</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Subject-wise Attendance Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Mandatory minimum 75% attendance threshold per subject as mandated by Silver Oak University regulations.
          </p>
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-3">
            {students.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium">Student:</label>
                <select
                  value={selectedStudentId}
                  onChange={e => handleStudentChange(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Students</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.enrollmentNo || s.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          </div>
        )}
      </div>

      {/* Aggregate Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Attendance</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{aggregatePct}%</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${aggregatePct >= 75 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {aggregatePct >= 75 ? 'Eligible' : 'Detention Risk'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{totalAttended} of {totalClasses} total lectures attended</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subjects Tracked</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{records.length}</span>
            <span className="text-xs font-semibold text-indigo-400">Computer Engg.</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Theory & Practical Batches</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shortage Warnings</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-3xl font-extrabold ${shortageCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {shortageCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">Subject{shortageCount === 1 ? '' : 's'} &lt; 75%</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {shortageCount > 0 ? 'Urgent make-up sessions required' : 'All subjects meet university criteria'}
          </p>
        </div>
      </div>

      {/* Subject Records Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Subject Breakdown & Shortfall Calculator
        </h2>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading attendance records...</div>
        ) : records.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
            <CalendarCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-300 font-medium">No attendance records found.</p>
            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="text-xs text-indigo-400 hover:underline font-semibold"
              >
                Click here to add the first attendance record
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {records.map(record => {
              const pct = record.totalClasses > 0 ? Math.round((record.attendedClasses / record.totalClasses) * 100) : 0;
              const isShortage = pct < 75;
              const neededClasses = calculateRequiredClasses(record.attendedClasses, record.totalClasses);

              return (
                <div
                  key={record.id}
                  className={`p-5 rounded-2xl bg-slate-900/80 border transition-all duration-300 shadow-lg ${
                    isShortage ? 'border-amber-500/40 hover:border-amber-500' : 'border-slate-800 hover:border-indigo-500/40'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {record.subjectCode}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">{record.subjectName}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{record.facultyName}</p>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(record)}
                          title="Edit record"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id, record.subjectName)}
                          title="Delete record"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {isAdmin && record.studentName && (
                    <div className="mb-3 text-[11px] font-medium text-slate-300 flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/60">
                      <UserIcon className="w-3 h-3 text-indigo-400" />
                      <span>Student: {record.studentName}</span>
                    </div>
                  )}

                  {/* Attendance Stats & Progress Bar */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-400 font-medium">Classes Attended:</span>
                      <span className="font-bold text-white">
                        {record.attendedClasses} <span className="text-slate-500 font-normal">/ {record.totalClasses}</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 85
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : pct >= 75
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                            : 'bg-gradient-to-r from-amber-500 to-rose-500'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold flex items-center gap-1 ${isShortage ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {isShortage ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {pct}%
                      </span>
                      <span className="text-[11px] text-slate-400">Min 75% required</span>
                    </div>
                  </div>

                  {/* Shortfall Alert or Good Standing badge */}
                  {isShortage ? (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-300">
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Shortage Recovery Action</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-200/90">
                        You must attend the next <strong className="text-white underline">{neededClasses} consecutive classes</strong> without absence to restore your attendance to 75%.
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Examination Safe
                      </span>
                      <span className="text-[11px] text-emerald-400/80">Keep it up!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Attendance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {editingRecord ? 'Update Attendance Record' : 'Record New Subject Attendance'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Faculty / Admin Portal &bull; Department of Computer Engineering
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              {!editingRecord && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Select Student *</label>
                  <select
                    required
                    value={formData.studentId}
                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.enrollmentNo || s.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CE601"
                    value={formData.subjectCode}
                    onChange={e => setFormData({ ...formData, subjectCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design and Analysis of Algorithms"
                  value={formData.subjectName}
                  onChange={e => setFormData({ ...formData, subjectName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Faculty Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. R. K. Patel"
                  value={formData.facultyName}
                  onChange={e => setFormData({ ...formData, facultyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Attended Lectures *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.attendedClasses}
                    onChange={e => setFormData({ ...formData, attendedClasses: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Total Lectures Held *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalClasses}
                    onChange={e => setFormData({ ...formData, totalClasses: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
                >
                  {editingRecord ? 'Save Changes' : 'Record Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
