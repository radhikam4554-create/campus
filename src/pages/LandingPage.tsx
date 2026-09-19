import React from 'react';
import {
  GraduationCap,
  Users,
  Shield,
  Sparkles,
  ClipboardCheck,
  Calendar,
  Award,
  Bell,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { UserRole } from '../types.js';

interface LandingPageProps {
  onGoToLogin: () => void;
  onSelectRoleDemo: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin, onSelectRoleDemo }) => {
  const { switchDemoRole } = useAuth();

  const handleQuickDemo = async (role: UserRole) => {
    await switchDemoRole(role);
    onSelectRoleDemo(role);
  };

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-950/80 border-b border-slate-200/70 dark:border-slate-800/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-500/25">
              C
            </div>
            <span className="font-extrabold text-lg tracking-tight font-display">
              CampusConnect
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="landing-login-btn"
              onClick={onGoToLogin}
              className="px-4 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Sign In
            </button>
            <button
              id="landing-get-started-btn"
              onClick={onGoToLogin}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Smart Campus SaaS</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight font-display max-w-4xl mx-auto leading-[1.1]">
          Campus management, <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 bg-clip-text text-transparent">
            simplified.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          One intelligent platform for students, faculty, and administrators. Seamlessly track attendance, grades, assignments, schedules, and institutional intelligence.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onGoToLogin}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <span>Launch CampusConnect</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleQuickDemo('student')}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold shadow-xs transition-colors"
          >
            Explore Student Demo
          </button>
        </div>

        {/* 1-Click Interactive Demo Role Selector Card */}
        <div className="mt-14 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 max-w-3xl mx-auto shadow-xl shadow-blue-900/5 text-left">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Instant Interactive Evaluation
              </h2>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Experience the 3 Specialized Role Dashboards with 1 Click
              </p>
            </div>
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              ● Live Demo Accounts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Student Card */}
            <button
              onClick={() => handleQuickDemo('student')}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2.5 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Student Portal
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Aarav Sharma · Sem 5
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-2">
                Open Dashboard →
              </span>
            </button>

            {/* Faculty Card */}
            <button
              onClick={() => handleQuickDemo('faculty')}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-sky-50/40 dark:hover:bg-sky-950/30 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-2.5 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Faculty Portal
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Dr. Rajesh Kulkarni · DBMS
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 mt-2">
                Open Dashboard →
              </span>
            </button>

            {/* Admin Card */}
            <button
              onClick={() => handleQuickDemo('admin')}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-700 dark:hover:border-blue-700 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-blue-100/40 dark:hover:bg-blue-900/30 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-200/80 dark:bg-blue-900/60 flex items-center justify-center text-blue-800 dark:text-blue-300 mb-2.5 group-hover:scale-110 transition-transform">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Admin Portal
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Prof. Sunita Rao · Registrar
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 mt-2">
                Open Dashboard →
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight">
              Engineered for Modern Universities
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Replace fragmented spreadsheets and legacy portals with a cohesive, responsive operating system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ClipboardCheck,
                title: 'Smart Attendance',
                desc: 'Real-time attendance tracking with automated 75% eligibility calculations, subject breakdown, and bulk marking for faculty.'
              },
              {
                icon: BarChart3,
                title: 'Academic Analytics',
                desc: 'Comprehensive performance dashboards with Recharts, tracking CGPA progression, internal marks, and department distribution.'
              },
              {
                icon: Layers,
                title: 'Assignment Management',
                desc: 'End-to-end workflow: faculty post coursework with deadlines, students upload submissions, and faculty return grades with feedback.'
              },
              {
                icon: Calendar,
                title: 'Dynamic Timetable',
                desc: 'Weekly lecture timetable with time slots, classroom mapping, and live highlight of ongoing sessions.'
              },
              {
                icon: Bell,
                title: 'Instant Notifications',
                desc: 'Targeted broadcast notices and real-time updates for assignments, grades, attendance changes, and exam schedules.'
              },
              {
                icon: Sparkles,
                title: 'AI Campus Assistant',
                desc: 'Integrated Gemini assistant grounded in authenticated student data, capable of calculating attendance buffers and answering queries.'
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role-Specific Capabilities */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Tailored Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight mt-1">
            Built for Every Campus Stakeholder
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">For Students</h3>
                <p className="text-xs text-slate-400">Master your academic journey</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 flex-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Attendance percent with 75% threshold safety margin</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Semester marks, internal/external splits & grade charts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Assignment submission tracking & feedback reviews</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>24/7 AI Campus Assistant with grounding</span>
              </li>
            </ul>
            <button
              onClick={() => handleQuickDemo('student')}
              className="mt-6 w-full py-2.5 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors text-center"
            >
              Test Student View
            </button>
          </div>

          {/* Faculty */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">For Faculty</h3>
                <p className="text-xs text-slate-400">Streamline classroom operations</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 flex-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Fast session attendance marking & bulk actions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Assignment creation, deadline enforcement & grading</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Internal & external marks entry with strict limits</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Upload lecture notes & slides directly to students</span>
              </li>
            </ul>
            <button
              onClick={() => handleQuickDemo('faculty')}
              className="mt-6 w-full py-2.5 text-xs font-bold rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 hover:bg-violet-100 transition-colors text-center"
            >
              Test Faculty View
            </button>
          </div>

          {/* Administrators */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">For Administrators</h3>
                <p className="text-xs text-slate-400">Institutional control & insight</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 flex-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Complete Student & Faculty CRUD with department filters</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Course, subject and timetable scheduling engine</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Multi-year enrollment, attendance & performance charts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Targeted campus-wide broadcast notices</span>
              </li>
            </ul>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="mt-6 w-full py-2.5 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors text-center"
            >
              Test Admin View
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-950 text-white text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display">
            Bring your campus together with CampusConnect.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
            Experience how modern universities unify academic tracking, faculty instruction, and administrative governance.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGoToLogin}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 shadow-xl transition-all"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => handleQuickDemo('student')}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-700/60 hover:bg-blue-700 border border-blue-400/40 text-white font-bold text-sm transition-all"
            >
              Explore Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-center text-xs border-t border-slate-800">
        <p>© 2025 CampusConnect — Smart Campus Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};
