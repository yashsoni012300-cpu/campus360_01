import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  LogOut,
  User as UserIcon,
  Shield,
  Menu,
  X,
  KeyRound,
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  Bell,
  MessageSquareWarning,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenDemoModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenDemoModal }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { success } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    success('Logged out successfully.');
    onNavigate('landing');
  };

  const navLinks = isAuthenticated
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
        { id: 'library', label: 'Library', icon: BookOpen },
        { id: 'news', label: 'News & Events', icon: Bell },
        { id: 'complaints', label: 'Grievances', icon: MessageSquareWarning },
        ...(isAdmin ? [{ id: 'admin-panel', label: 'Admin Panel', icon: Sliders }] : [])
      ]
    : [
        { id: 'landing', label: 'Home', icon: GraduationCap },
        { id: 'library-preview', label: 'Library Catalog', icon: BookOpen },
        { id: 'news-preview', label: 'Campus Updates', icon: Bell }
      ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#070b16]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & SOU Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
              className="flex items-center gap-2.5 text-left group transition"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  Campus360
                  <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                    SOU
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium hidden md:inline leading-none">
                  Silver Oak University &bull; Computer Engineering
                </span>
              </div>
            </button>

            {/* Viksit Bharat @ 2047 pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500/10 via-white/5 to-emerald-500/10 border border-slate-700/60 text-[11px] text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Smart Campus &bull; Viksit Bharat @ 2047</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* User actions / Demo Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Demo credentials trigger */}
            <button
              onClick={onOpenDemoModal}
              title="View pre-seeded student and admin demo accounts"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/90 text-indigo-300 border border-indigo-500/20 transition shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Demo Logins</span>
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {/* User capsule */}
                <div className="hidden sm:flex items-center gap-2.5 pl-2.5 pr-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                      isAdmin ? 'bg-purple-600' : 'bg-blue-600'
                    }`}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white max-w-[120px] truncate leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                      {isAdmin ? (
                        <>
                          <Shield className="w-2.5 h-2.5 text-purple-400" />
                          <span className="text-purple-300 font-medium">Faculty Admin</span>
                        </>
                      ) : (
                        <>
                          <UserIcon className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="text-emerald-300 font-medium">Student</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  title="Sign out of Campus360"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition"
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 transition"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#070b16] px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2">
          {isAuthenticated && user && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 mb-2">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white ${
                  isAdmin ? 'bg-purple-600' : 'bg-blue-600'
                }`}
              >
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{user.name}</span>
                <span className="text-xs text-slate-400">{user.email} &bull; <strong className="capitalize text-indigo-400">{user.role}</strong></span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  {link.label}
                </button>
              );
            })}
          </div>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-center rounded-xl text-sm font-medium bg-slate-800 text-white"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  onNavigate('register');
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-center rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
