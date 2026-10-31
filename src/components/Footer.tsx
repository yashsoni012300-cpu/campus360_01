import React from 'react';
import { GraduationCap, Award, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#050811] border-t border-slate-800 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800/80">
        {/* University & Project Identity */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg tracking-tight">Campus360</h3>
              <p className="text-xs text-indigo-400 font-medium">Silver Oak University</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Integrated Digital Hub for Campus Services and Academic Resources. Supporting the Smart Campus concept under the visionary <strong className="text-slate-200">Viksit Bharat @ 2047</strong> framework.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Department of Computer Engineering
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <Award className="w-3.5 h-3.5" /> PBL-1 Project
            </span>
          </div>
        </div>

        {/* Project Team - Group 40 */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white tracking-wide uppercase text-indigo-300 flex items-center gap-2">
            Project Development Team <span className="text-xs font-normal text-slate-400">(Group 40)</span>
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-200 font-medium">Anjani Hitiksha D</span>
              <span className="text-slate-500">21012011041</span>
            </li>
            <li className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-200 font-medium">Soni Yash</span>
              <span className="text-slate-500">21012011040</span>
            </li>
            <li className="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-200 font-medium">Gandhi Jeel M</span>
              <span className="text-slate-500">21012011042</span>
            </li>
            <li className="flex items-center justify-between py-1">
              <span className="text-slate-200 font-medium">Patel Venish J</span>
              <span className="text-slate-500">21012011043</span>
            </li>
          </ul>
        </div>

        {/* Faculty Guide & Vision */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white tracking-wide uppercase text-indigo-300">
            Project Mentorship & Vision
          </h4>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <p className="text-xs text-slate-400">Project Guide & Supervisor:</p>
            <p className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Ms. Kruti Sheth</span>
            </p>
            <p className="text-xs text-indigo-400">Assistant Professor, Dept. of Computer Engineering</p>
          </div>
          <div className="text-xs text-slate-400 leading-relaxed">
            Silver Oak University, SG Highway, Gota, Ahmedabad, Gujarat 382481.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Silver Oak University. All rights reserved.</span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="text-slate-400">Smart Campus Portal</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <span>Built for Viksit Bharat @ 2047 with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-0.5 inline" />
          <span>by Group 40</span>
        </div>
      </div>
    </footer>
  );
};
