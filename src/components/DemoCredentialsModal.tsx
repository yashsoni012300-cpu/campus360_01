import React from 'react';
import { KeyRound, UserCheck, ShieldAlert, Copy, Check, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: () => void;
}

export const DemoCredentialsModal: React.FC<Props> = ({ isOpen, onClose, onSuccessLogin }) => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [loggingInRole, setLoggingInRole] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    success(`Copied: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleQuickLogin = async (email: string, pass: string, roleName: string) => {
    setLoggingInRole(roleName);
    const result = await login(email, pass);
    setLoggingInRole(null);
    if (result.success) {
      success(`Logged in as ${roleName}!`);
      onClose();
      if (onSuccessLogin) onSuccessLogin();
    } else {
      error(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Pre-Configured Demo Credentials</h3>
            <p className="text-xs text-slate-400">Silver Oak University Campus360 Evaluation</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          Both demo accounts are pre-seeded in the database with sample attendance, issued books, and grievance tickets. Click below for instant one-click login.
        </p>

        <div className="space-y-4">
          {/* Student Account */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 transition">
            <div className="flex items-center justify-between mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <UserCheck className="w-3.5 h-3.5" /> Student Account
              </span>
              <button
                disabled={!!loggingInRole}
                onClick={() => handleQuickLogin('student@campus360.com', 'Student@123', 'Demo Student')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition shadow-sm disabled:opacity-50"
              >
                {loggingInRole === 'Demo Student' ? 'Signing in...' : 'Quick Login'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-900/60 font-mono">
                <span className="text-slate-400">Email:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white select-all">student@campus360.com</span>
                  <button
                    onClick={() => copyToClipboard('student@campus360.com', 'std_email')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'std_email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-900/60 font-mono">
                <span className="text-slate-400">Password:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white select-all">Student@123</span>
                  <button
                    onClick={() => copyToClipboard('Student@123', 'std_pass')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'std_pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Account */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/40 transition">
            <div className="flex items-center justify-between mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShieldAlert className="w-3.5 h-3.5" /> Admin / Faculty Account
              </span>
              <button
                disabled={!!loggingInRole}
                onClick={() => handleQuickLogin('admin@campus360.com', 'Admin@123', 'Demo Admin')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white flex items-center gap-1 transition shadow-sm disabled:opacity-50"
              >
                {loggingInRole === 'Demo Admin' ? 'Signing in...' : 'Quick Login'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-900/60 font-mono">
                <span className="text-slate-400">Email:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white select-all">admin@campus360.com</span>
                  <button
                    onClick={() => copyToClipboard('admin@campus360.com', 'adm_email')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'adm_email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-900/60 font-mono">
                <span className="text-slate-400">Password:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white select-all">Admin@123</span>
                  <button
                    onClick={() => copyToClipboard('Admin@123', 'adm_pass')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'adm_pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
