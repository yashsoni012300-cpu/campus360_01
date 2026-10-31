import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  BookOpen,
  Bell,
  MessageSquareWarning,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookMarked
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { DashboardStats, NewsItem, Complaint } from '../types/index.ts';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user, authFetch } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats
        const [statsRes, newsRes, complaintsRes] = await Promise.all([
          authFetch('/api/stats/overview'),
          authFetch('/api/news'),
          authFetch('/api/complaints')
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) setStats(statsData.data);
        }

        if (newsRes.ok) {
          const newsData = await newsRes.json();
          if (newsData.success) setRecentNews(newsData.data.slice(0, 3));
        }

        if (complaintsRes.ok) {
          const compData = await complaintsRes.json();
          if (compData.success) setRecentComplaints(compData.data.slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authFetch]);

  const avgAttendance = stats?.averageAttendance ?? 82;
  const isAttendanceShortage = avgAttendance < 75 || (stats?.shortageSubjects && stats.shortageSubjects.length > 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/60 border border-indigo-500/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Department of Computer Engineering &bull; Sem {user?.semester || 6}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Enrollment No: <span className="font-mono text-indigo-300 font-semibold">{user?.enrollmentNo || '21012011040'}</span> &bull; Silver Oak Smart Campus Hub
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('attendance')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
            >
              <CalendarCheck className="w-4 h-4" />
              Check Attendance
            </button>
            <button
              onClick={() => onNavigate('complaints')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition"
            >
              <MessageSquareWarning className="w-4 h-4 text-emerald-400" />
              File Grievance
            </button>
          </div>
        </div>
      </div>

      {/* Shortage Alert Banner (if <75%) */}
      {isAttendanceShortage && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-300">Mandatory Attendance Threshold Warning (&lt; 75%)</h3>
              <p className="text-xs text-amber-200/80 leading-relaxed mt-0.5">
                {stats?.shortageSubjects && stats.shortageSubjects.length > 0 ? (
                  <span>
                    You have attendance shortage in: <strong className="text-white">{stats.shortageSubjects.join(', ')}</strong>. Attend forthcoming practical and theory lectures to ensure exam eligibility.
                  </span>
                ) : (
                  <span>Your aggregate attendance is currently {avgAttendance}%. SOU university regulations require at least 75% for mid-sem and end-sem exam hall tickets.</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold shrink-0 transition"
          >
            Open Shortfall Calculator
          </button>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Attendance */}
        <div
          onClick={() => onNavigate('attendance')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${avgAttendance >= 75 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{loading ? '--' : `${avgAttendance}%`}</span>
            <span className={`text-xs font-semibold ${avgAttendance >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {avgAttendance >= 75 ? 'Eligible' : 'Shortage'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>{stats?.totalSubjects || 5} Enrolled Subjects</span>
            <span className="text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-medium">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* Card 2: Library Books */}
        <div
          onClick={() => onNavigate('library')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Library Books</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{loading ? '--' : stats?.availableBooks ?? 6}</span>
            <span className="text-xs font-semibold text-indigo-400">Available Now</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>{stats?.myBorrowedBooksCount ? `${stats.myBorrowedBooksCount} Issued to you` : '0 currently issued'}</span>
            <span className="text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-medium">
              Browse <ArrowRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* Card 3: Latest News & Circulars */}
        <div
          onClick={() => onNavigate('news')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Campus News</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{loading ? '--' : stats?.latestNewsCount ?? 3}</span>
            <span className="text-xs font-semibold text-purple-400">Active Notices</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Exams & Hackathons</span>
            <span className="text-purple-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-medium">
              Read <ArrowRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* Card 4: My Grievances */}
        <div
          onClick={() => onNavigate('complaints')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Complaints</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{loading ? '--' : stats?.myComplaintsCount ?? 2}</span>
            <span className="text-xs font-semibold text-emerald-400">
              {stats?.myActiveComplaints ? `${stats.myActiveComplaints} Pending` : 'All Resolved'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Direct Faculty Action</span>
            <span className="text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-medium">
              Track <ArrowRight className="w-3 h-3" />
            </span>
          </p>
        </div>
      </div>

      {/* Two Column Layout: Recent Notices & Grievance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              Recent Campus Notices
            </h2>
            <button
              onClick={() => onNavigate('news')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentNews.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent campus notices.</p>
            ) : (
              recentNews.map(item => (
                <div
                  key={item.id}
                  onClick={() => onNavigate('news')}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.type === 'Notice' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                      {item.type} &bull; {item.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-white line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Recent Grievance Tickets */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4 text-emerald-400" />
              My Grievance Status
            </h2>
            <button
              onClick={() => onNavigate('complaints')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              Submit Ticket <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentComplaints.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">You have no active grievance or feedback tickets.</p>
                <button
                  onClick={() => onNavigate('complaints')}
                  className="text-xs text-emerald-400 font-semibold hover:underline"
                >
                  Submit feedback or report an issue &rarr;
                </button>
              </div>
            ) : (
              recentComplaints.map(complaint => (
                <div
                  key={complaint.id}
                  onClick={() => onNavigate('complaints')}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {complaint.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        complaint.status === 'Resolved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : complaint.status === 'In Progress'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {complaint.status}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-white line-clamp-1">{complaint.subject}</h3>
                  {complaint.adminRemark && (
                    <div className="text-[11px] p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-indigo-300">
                      <strong className="text-white">Admin Remark:</strong> {complaint.adminRemark}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
