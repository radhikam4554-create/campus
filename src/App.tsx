import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { ToastProvider } from './context/ToastContext.js';

// Layout & Global Modals
import { Navbar } from './components/layout/Navbar.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { GlobalSearchModal } from './components/common/GlobalSearchModal.js';
import { AiAssistantModal } from './components/ai/AiAssistantModal.js';

// Auth & Public Pages
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard.js';
import { StudentAttendance } from './pages/student/StudentAttendance.js';
import { StudentMarks } from './pages/student/StudentMarks.js';
import { StudentTimetable } from './pages/student/StudentTimetable.js';
import { StudentAssignments } from './pages/student/StudentAssignments.js';
import { StudentNotes } from './pages/student/StudentNotes.js';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard.js';
import { FacultyAttendance } from './pages/faculty/FacultyAttendance.js';
import { FacultyAssignments } from './pages/faculty/FacultyAssignments.js';
import { FacultyMarks } from './pages/faculty/FacultyMarks.js';
import { FacultyNotes } from './pages/faculty/FacultyNotes.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AdminStudents } from './pages/admin/AdminStudents.js';
import { AdminFaculty } from './pages/admin/AdminFaculty.js';
import { AdminDepartments } from './pages/admin/AdminDepartments.js';
import { AdminTimetable } from './pages/admin/AdminTimetable.js';

// Common Pages
import { NoticesPage } from './pages/common/NoticesPage.js';
import { NotificationsPage } from './pages/common/NotificationsPage.js';
import { ProfilePage } from './pages/common/ProfilePage.js';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [publicView, setPublicView] = useState<'landing' | 'login'>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 animate-bounce">
          C
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-500 animate-pulse">
          Starting CampusConnect Secure System...
        </p>
      </div>
    );
  }

  // If user is not authenticated, show Landing or Login page
  if (!isAuthenticated || !user) {
    if (publicView === 'login') {
      return (
        <LoginPage
          onBackToHome={() => setPublicView('landing')}
          onLoginSuccess={() => setActiveView('dashboard')}
        />
      );
    }
    return (
      <LandingPage
        onGoToLogin={() => setPublicView('login')}
        onSelectRoleDemo={() => setActiveView('dashboard')}
      />
    );
  }

  // Handle navigation
  const handleNavigate = (view: string) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render view based on role and activeView
  const renderActiveView = () => {
    const role = user.role;

    // Common views
    if (activeView === 'notices') return <NoticesPage />;
    if (activeView === 'notifications') return <NotificationsPage />;
    if (activeView === 'profile') return <ProfilePage />;

    // Student Views
    if (role === 'student') {
      switch (activeView) {
        case 'dashboard':
          return <StudentDashboard onNavigate={handleNavigate} onOpenAi={() => setAiOpen(true)} />;
        case 'attendance':
          return <StudentAttendance />;
        case 'marks':
          return <StudentMarks />;
        case 'timetable':
          return <StudentTimetable />;
        case 'assignments':
          return <StudentAssignments />;
        case 'notes':
          return <StudentNotes />;
        default:
          return <StudentDashboard onNavigate={handleNavigate} onOpenAi={() => setAiOpen(true)} />;
      }
    }

    // Faculty Views
    if (role === 'faculty') {
      switch (activeView) {
        case 'dashboard':
          return <FacultyDashboard onNavigate={handleNavigate} onOpenAi={() => setAiOpen(true)} />;
        case 'faculty-attendance':
          return <FacultyAttendance />;
        case 'faculty-assignments':
          return <FacultyAssignments />;
        case 'faculty-marks':
          return <FacultyMarks />;
        case 'faculty-notes':
          return <FacultyNotes />;
        default:
          return <FacultyDashboard onNavigate={handleNavigate} onOpenAi={() => setAiOpen(true)} />;
      }
    }

    // Admin Views
    if (role === 'admin') {
      switch (activeView) {
        case 'dashboard':
        case 'admin-analytics':
          return <AdminDashboard onNavigate={handleNavigate} />;
        case 'admin-students':
          return <AdminStudents />;
        case 'admin-faculty':
          return <AdminFaculty />;
        case 'admin-departments':
        case 'admin-subjects':
          return <AdminDepartments />;
        case 'admin-timetable':
          return <AdminTimetable />;
        default:
          return <AdminDashboard onNavigate={handleNavigate} />;
      }
    }

    return <StudentDashboard onNavigate={handleNavigate} onOpenAi={() => setAiOpen(true)} />;
  };

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onNavigate={handleNavigate}
        activeView={activeView}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenAi={() => setAiOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto min-w-0 pb-16">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      <AiAssistantModal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
