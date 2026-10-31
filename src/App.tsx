import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { DemoCredentialsModal } from './components/DemoCredentialsModal.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { StudentDashboard } from './pages/StudentDashboard.tsx';
import { AttendancePage } from './pages/AttendancePage.tsx';
import { LibraryPage } from './pages/LibraryPage.tsx';
import { NewsPage } from './pages/NewsPage.tsx';
import { ComplaintsPage } from './pages/ComplaintsPage.tsx';
import { AdminPanel } from './pages/AdminPanel.tsx';

function MainApp() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const { warning } = useToast();

  // Route state initialized from window hash or default
  const getInitialPage = () => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash) return hash;
    return 'landing';
  };

  const [currentPage, setCurrentPage] = useState<string>(getInitialPage);
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);

  // Sync state with window hash so back/forward and refresh work seamlessly
  useEffect(() => {
    const handleHashChange = () => {
      const page = window.location.hash.replace('#/', '').replace('#', '');
      if (page) setCurrentPage(page);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: string) => {
    window.location.hash = `#/${page}`;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route protection rules
  useEffect(() => {
    if (isLoading) return;

    const protectedPages = ['dashboard', 'attendance', 'library', 'news', 'complaints', 'admin-panel'];

    // Unauthenticated user attempting to open protected page
    if (!isAuthenticated && protectedPages.includes(currentPage)) {
      warning('Please log in to access this campus module.');
      navigateTo('login');
      return;
    }

    // Authenticated user attempting to open login or register
    if (isAuthenticated && (currentPage === 'login' || currentPage === 'register')) {
      navigateTo(isAdmin ? 'admin-panel' : 'dashboard');
      return;
    }

    // Student attempting to open admin panel
    if (isAuthenticated && !isAdmin && currentPage === 'admin-panel') {
      warning('Access denied: Admin credentials required.');
      navigateTo('dashboard');
      return;
    }
  }, [currentPage, isAuthenticated, isAdmin, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b16] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold tracking-wider uppercase text-indigo-400">Loading Campus360...</p>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={navigateTo} onOpenDemoModal={() => setDemoModalOpen(true)} />;
      case 'login':
        return (
          <AuthPage
            initialMode="login"
            onSuccess={role => navigateTo(role === 'admin' ? 'admin-panel' : 'dashboard')}
          />
        );
      case 'register':
        return (
          <AuthPage
            initialMode="register"
            onSuccess={role => navigateTo(role === 'admin' ? 'admin-panel' : 'dashboard')}
          />
        );
      case 'dashboard':
        return <StudentDashboard onNavigate={navigateTo} />;
      case 'attendance':
        return <AttendancePage />;
      case 'library':
      case 'library-preview':
        return <LibraryPage />;
      case 'news':
      case 'news-preview':
        return <NewsPage />;
      case 'complaints':
        return <ComplaintsPage />;
      case 'admin-panel':
        return <AdminPanel onNavigate={navigateTo} />;
      default:
        return <LandingPage onNavigate={navigateTo} onOpenDemoModal={() => setDemoModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onOpenDemoModal={() => setDemoModalOpen(true)}
      />

      <main className="flex-1 w-full pb-16">
        {renderPage()}
      </main>

      <Footer />

      <DemoCredentialsModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onSuccessLogin={() => navigateTo('dashboard')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
