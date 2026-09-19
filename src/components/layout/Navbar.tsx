import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Moon, Sun, ChevronDown, LogOut, User as UserIcon, Settings, Menu, Shield, GraduationCap, BookOpen, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { NotificationItem, UserRole } from '../../types.js';
import api from '../../api/client.js';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onNavigate: (view: string) => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
  onNavigate
}) => {
  const { user, logout, switchDemoRole, unreadNotifications, setUnreadNotifications } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenNotifications = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      loadNotifications();
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotifications(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleSwitch = (role: UserRole) => {
    setRoleSwitcherOpen(false);
    switchDemoRole(role);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      {/* Left side: Hamburger + Search Trigger */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-btn"
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Button */}
        <button
          id="global-search-trigger"
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3.5 py-1.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-all w-48 sm:w-64 md:w-80 text-left border border-slate-200/60 dark:border-slate-700/60"
        >
          <Search className="w-4 h-4 shrink-0 text-slate-400" />
          <span className="flex-1 truncate">Search courses, notices, faculty...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right side: Role switcher, Notifications, Theme toggle, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher Pill */}
        <div className="relative" ref={roleRef}>
          <button
            id="role-switcher-btn"
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
            title="Switch Demo Role"
          >
            {user?.role === 'admin' && <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
            {user?.role === 'faculty' && <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
            {user?.role === 'student' && <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
            <span className="capitalize">{user?.role || 'Switch Role'}</span>
            <ChevronDown className="w-3 h-3 text-blue-500" />
          </button>

          {roleSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-48 py-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Switch Demo Role
              </div>
              <button
                onClick={() => handleRoleSwitch('student')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 ${
                  user?.role === 'student' ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/30' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Student (Aarav)
                </span>
                {user?.role === 'student' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
              <button
                onClick={() => handleRoleSwitch('faculty')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 ${
                  user?.role === 'faculty' ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/30' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Faculty (Dr. Rajesh)
                </span>
                {user?.role === 'faculty' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 ${
                  user?.role === 'admin' ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/30' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Admin (Prof. Sunita)
                </span>
                {user?.role === 'admin' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-btn"
            onClick={handleOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 py-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-700/60">
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Notifications
                </div>
                <button
                  onClick={markAllRead}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Mark all as read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/40">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div
                      key={n._id}
                      onClick={() => {
                        setNotifOpen(false);
                        onNavigate('notifications');
                      }}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors ${
                        !n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-xs text-slate-800 dark:text-slate-200">
                          {n.title}
                        </div>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1.5 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-700/60 text-center">
                <button
                  onClick={() => {
                    setNotifOpen(false);
                    onNavigate('notifications');
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            id="user-profile-menu-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {user?.name}
              </span>
              <span className="text-[10px] font-medium text-slate-400 capitalize">
                {user?.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 py-1.5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/60">
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {user?.name}
                </div>
                <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                <div className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {user?.role} · {user?.departmentName?.split(' ')[0]}
                </div>
              </div>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate('settings');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                Profile Details
              </button>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate('settings');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Account Settings
              </button>

              <div className="border-t border-slate-100 dark:border-slate-700/60 my-1"></div>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
