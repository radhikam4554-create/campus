import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  Award,
  Calendar,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  Users,
  Building2,
  GraduationCap,
  PieChart,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenAi: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  onOpenAi
}) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'student';

  const getMenuItems = () => {
    if (role === 'student') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
        { id: 'assignments', label: 'Assignments', icon: FileText },
        { id: 'marks', label: 'Marks & Results', icon: Award },
        { id: 'timetable', label: 'Timetable', icon: Calendar },
        { id: 'notes', label: 'Lecture Notes', icon: BookOpen },
        { id: 'notices', label: 'Notices', icon: Bell },
      ];
    } else if (role === 'faculty') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'faculty-attendance', label: 'Attendance', icon: ClipboardCheck },
        { id: 'faculty-assignments', label: 'Assignments', icon: FileText },
        { id: 'faculty-marks', label: 'Marks', icon: Award },
        { id: 'faculty-notes', label: 'Course Notes', icon: BookOpen },
        { id: 'notices', label: 'Notices', icon: Bell },
      ];
    } else {
      // admin
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'admin-analytics', label: 'Analytics', icon: PieChart },
        { id: 'admin-students', label: 'Students', icon: GraduationCap },
        { id: 'admin-faculty', label: 'Faculty', icon: Users },
        { id: 'admin-departments', label: 'Departments', icon: Building2 },
        { id: 'admin-subjects', label: 'Courses & Subjects', icon: BookOpen },
        { id: 'admin-timetable', label: 'Timetable', icon: Calendar },
        { id: 'notices', label: 'Notices', icon: Bell },
      ];
    }
  };

  const menuItems = getMenuItems();

  const handleNavClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 w-64 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/25">
            C
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-display">
              CampusConnect
            </span>
            <span className="block text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {role} portal
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Main Menu
        </div>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        {/* AI Assistant Special Item */}
        <div className="pt-3 pb-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Smart Features
          </div>
          <button
            id="nav-ai-assistant"
            onClick={() => {
              onOpenAi();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/50 hover:from-blue-100 hover:to-sky-100 transition-all text-left shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span>AI Assistant</span>
            </div>
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-blue-200/70 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
              Gemini
            </span>
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 space-y-1">
        <button
          id="nav-settings"
          onClick={() => handleNavClick('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
            activeView === 'settings'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>

        <button
          id="nav-logout"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

        {/* User preview chip */}
        <div className="pt-2 px-2 flex items-center gap-2.5">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt=""
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
              {user?.name}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user?.collegeId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen">
        {content}
      </aside>

      {/* Mobile Drawer (Slide-out with backdrop) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
