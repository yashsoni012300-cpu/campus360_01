import React from 'react';
import {
  GraduationCap,
  Sparkles,
  CalendarCheck,
  BookOpen,
  Bell,
  MessageSquareWarning,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  Compass,
  KeyRound,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onOpenDemoModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenDemoModal }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#0a1024] via-[#070b16] to-[#070b16]">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/20 to-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Institutional badges */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-xl backdrop-blur-md">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm">
              <GraduationCap className="w-3.5 h-3.5" /> Silver Oak University
            </span>
            <span className="px-2 py-0.5 text-indigo-300 font-medium">Department of Computer Engineering</span>
            <span className="hidden sm:inline text-slate-600">&bull;</span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold px-2">
              <Sparkles className="w-3 h-3" /> Viksit Bharat @ 2047
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Integrated Digital Hub for{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Campus Services & Academic Resources
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            Eliminate fragmented physical notice boards and manual registers. <strong className="text-white">Campus360</strong> consolidates subject-wise attendance, live library availability, administrative announcements, and student grievance redressal into one secure smart campus portal.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => onNavigate(isAdmin ? 'admin-panel' : 'dashboard')}
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition hover:scale-[1.02]"
              >
                Go to {isAdmin ? 'Admin Panel' : 'Student Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition hover:scale-[1.02]"
                >
                  Student / Faculty Login
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition"
                >
                  Create Student Account
                </button>
              </>
            )}

            <button
              onClick={onOpenDemoModal}
              className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 flex items-center gap-2 transition"
            >
              <KeyRound className="w-4 h-4 text-indigo-400" />
              Try Demo Accounts
            </button>
          </div>

          {/* Project Tagline Pill */}
          <div className="pt-4 text-xs text-slate-500">
            Project-Based Learning (PBL-1) &bull; Mentored by Ms. Kruti Sheth &bull; Group 40
          </div>
        </div>
      </section>

      {/* The 4 Core Feature Cards */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs uppercase tracking-wider font-bold text-indigo-400">Integrated Pillars</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            Four Modular Pillars Powering the Smart Campus
          </p>
          <p className="text-sm text-slate-400">
            Engineered specifically to solve real university administration bottlenecks for Silver Oak students & faculty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Attendance */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition duration-300 group hover:-translate-y-1 shadow-lg hover:shadow-blue-500/10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Subject Attendance</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Real-time subject-wise percentage metrics, attended versus total lectures, and automated warning notifications when below the mandatory 75% threshold.
            </p>
            <div className="text-[11px] font-semibold text-blue-400 flex items-center gap-1">
              <span>Shortage Alert Engine</span> &bull; <span>Admin Edit</span>
            </div>
          </div>

          {/* Card 2: Library */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition duration-300 group hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/10">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Library Catalog</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Instant searchable directory with live availability toggling, rack location navigation, ISBN lookup, and issued student accountability.
            </p>
            <div className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1">
              <span>Live Search & Filter</span> &bull; <span>Rack Locator</span>
            </div>
          </div>

          {/* Card 3: News & Events */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition duration-300 group hover:-translate-y-1 shadow-lg hover:shadow-purple-500/10">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Campus Notices & Events</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Pinned circulars, mid-semester exam dates, hackathons, and PBL exhibition announcements categorized by department and academic urgency.
            </p>
            <div className="text-[11px] font-semibold text-purple-400 flex items-center gap-1">
              <span>Department Filters</span> &bull; <span>Exam Alerts</span>
            </div>
          </div>

          {/* Card 4: Complaints & Grievance */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition duration-300 group hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Grievance Redressal</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Direct digital grievance submission across lab hardware, Wi-Fi, hostel, or academics with transparent tracking (Open, In Progress, Resolved) and faculty remarks.
            </p>
            <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <span>Status Lifecycle</span> &bull; <span>Remark Audit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution / Vision Comparison */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/70 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">PBL-1 Problem Statement</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Transforming Traditional Campus Inefficiencies
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Why Silver Oak University needs a single integrated digital hub under Viksit Bharat @ 2047.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* The Problem */}
            <div className="p-6 rounded-2xl bg-rose-950/15 border border-rose-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-400 font-bold text-base mb-3">
                  <AlertCircle className="w-5 h-5" />
                  <h3>The Existing Problem</h3>
                </div>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">&times;</span>
                    <span>Students depend on physical notice boards that get crowded, torn, or missed.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">&times;</span>
                    <span>Attendance discrepancy discovered only right before final exams, causing sudden detentions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">&times;</span>
                    <span>Manual book searches at library shelves waste valuable study and project time.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">&times;</span>
                    <span>Paper complaints lack tracking, leaving students unaware if issues are being addressed.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-rose-500/20 text-[11px] text-rose-300/80 italic font-medium">
                Causes delays, confusion, and bureaucratic friction.
              </div>
            </div>

            {/* The Solution */}
            <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex flex-col justify-between shadow-xl shadow-indigo-950/30">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-base mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3>The Campus360 Solution</h3>
                </div>
                <ul className="space-y-3 text-xs text-slate-200">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">&bull;</span>
                    <span>Consolidated digital portal accessible from any phone, laptop, or campus lab terminal.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">&bull;</span>
                    <span>Automated attendance percentages with shortfall calculators for proactive improvement.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">&bull;</span>
                    <span>Real-time library catalog with rack locator and one-click availability check.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">&bull;</span>
                    <span>Digitized ticket lifecycle with real-time status updates and faculty remarks.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-indigo-500/20 text-[11px] text-indigo-300 font-semibold">
                Single unified interface for students, faculty & administrators.
              </div>
            </div>

            {/* The Vision */}
            <div className="p-6 rounded-2xl bg-emerald-950/15 border border-emerald-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base mb-3">
                  <Compass className="w-5 h-5" />
                  <h3>Viksit Bharat @ 2047 Vision</h3>
                </div>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">&check;</span>
                    <span>Zero-paper administrative operations supporting environmental sustainability.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">&check;</span>
                    <span>Empowering technological self-reliance (Atmanirbhar) with student-led innovations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">&check;</span>
                    <span>Transparent, accountable governance in premier Indian technical universities.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">&check;</span>
                    <span>Fostering next-generation digital competency from undergraduate projects.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-500/20 text-[11px] text-emerald-300/80 font-medium">
                Aligning higher education infrastructure with national transformation.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Banner */}
      <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border border-slate-800">
          <div className="text-center p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">100%</p>
            <p className="text-xs text-slate-400 mt-1">Paperless Workflow</p>
          </div>
          <div className="text-center p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">75%</p>
            <p className="text-xs text-slate-400 mt-1">Attendance Threshold Guard</p>
          </div>
          <div className="text-center p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-400">24/7</p>
            <p className="text-xs text-slate-400 mt-1">Library Catalog & Grievance Access</p>
          </div>
          <div className="text-center p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">SOU CE</p>
            <p className="text-xs text-slate-400 mt-1">Computer Engineering PBL-1</p>
          </div>
        </div>
      </section>
    </div>
  );
};
