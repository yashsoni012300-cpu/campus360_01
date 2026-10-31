import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Users,
  CalendarCheck,
  BookOpen,
  Bell,
  MessageSquareWarning,
  Search,
  Trash2,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { StudentWithStats, DashboardStats } from '../types/index.ts';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate }) => {
  const { user, isAdmin, authFetch } = useAuth();
  const { success, error } = useToast();

  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, statsRes] = await Promise.all([
        authFetch('/api/students'),
        authFetch('/api/stats/overview')
      ]);

      if (studentsRes.ok) {
        const sData = await studentsRes.json();
        if (sData.success) setStudents(sData.data);
      }

      if (statsRes.ok) {
        const stData = await statsRes.json();
        if (stData.success) setStats(stData.data);
      }
    } catch (err) {
      error('Failed to load admin panel data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  // Role guard check
  if (!isAdmin) {
    return (
      <div className="w-full max-w-lg mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-rose-500/30 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Administrative Access Restricted</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          You are currently signed in as a student. Only authorized Silver Oak University faculty guides and administrators can access the master control panel.
        </p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold"
        >
          Return to Student Dashboard
        </button>
      </div>
    );
  }

  const handleDeleteStudent = async (student: StudentWithStats) => {
    if (!confirm(`Are you sure you want to permanently delete student account for "${student.name}"? This will also remove their attendance and grievance records.`)) return;

    try {
      const res = await authFetch(`/api/students/${student.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success(data.message);
        fetchData();
      } else {
        error(data.message);
      }
    } catch (err) {
      error('Failed to delete student.');
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.enrollmentNo && s.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Faculty Administrator Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Campus360 System Overview & Student Registry
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Silver Oak University &bull; Department of Computer Engineering &bull; Full CRUD Authority for Attendance, Library, Notices & Redressal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono">
              Admin: {user?.name}
            </span>
          </div>
        </div>
      </div>

      {/* Campus Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Students</span>
          <p className="text-3xl font-extrabold text-white mt-2">{students.length}</p>
          <p className="text-[11px] text-indigo-400 mt-1">Computer Engineering Batch</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Campus Avg Attendance</span>
          <p className="text-3xl font-extrabold text-white mt-2">{stats?.campusAvgAttendance ?? 84}%</p>
          <p className="text-[11px] text-emerald-400 mt-1">Across all subjects</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Library Circulation</span>
          <p className="text-3xl font-extrabold text-white mt-2">
            {stats?.issuedBooks ?? 2} <span className="text-slate-500 text-sm font-normal">/ {stats?.totalBooks ?? 8} issued</span>
          </p>
          <p className="text-[11px] text-indigo-400 mt-1">{stats?.availableBooks ?? 6} on shelf</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Grievances</span>
          <p className="text-3xl font-extrabold text-amber-400 mt-2">
            {(stats?.openComplaints ?? 1) + (stats?.inProgressComplaints ?? 1)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{stats?.resolvedComplaints ?? 1} resolved tickets</p>
        </div>
      </div>

      {/* Direct Administrative Actions Bar */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">Administrative Module Shortcuts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('attendance')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Manage Attendance</p>
                <p className="text-[10px] text-slate-400">Add / Edit student attendance</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={() => onNavigate('library')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Manage Library</p>
                <p className="text-[10px] text-slate-400">Catalog, rack & issue toggles</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={() => onNavigate('news')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 flex items-center justify-between text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Publish Circulars</p>
                <p className="text-[10px] text-slate-400">Broadcast exams & notices</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={() => onNavigate('complaints')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <MessageSquareWarning className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Resolve Grievances</p>
                <p className="text-[10px] text-slate-400">Review tickets & remarks</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>

      {/* Student Registry Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Registered Student Directory
            </h2>
            <p className="text-xs text-slate-400">Search and monitor student attendance health, grievances, and accounts.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or enrollment..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading student directory...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">No students found matching your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Enrollment No</th>
                  <th className="py-3 px-4">Department & Sem</th>
                  <th className="py-3 px-4">Avg Attendance</th>
                  <th className="py-3 px-4">Grievance Tickets</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{student.name}</div>
                      <div className="text-[11px] text-slate-500">{student.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {student.enrollmentNo || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{student.department}</div>
                      <div className="text-[10px] text-indigo-400">Semester {student.semester || 6}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${student.averageAttendance >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {student.averageAttendance}%
                        </span>
                        {student.hasShortage && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold">
                            Shortage Warning
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">{student.subjectsCount} subjects recorded</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {student.complaintsCount} submitted
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteStudent(student)}
                        title="Delete Student Account"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
