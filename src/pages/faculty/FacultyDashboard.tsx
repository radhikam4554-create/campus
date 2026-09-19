import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  ClipboardCheck,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Award,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import api from '../../api/client.js';

interface FacultyDashboardProps {
  onNavigate: (view: string) => void;
  onOpenAi: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ onNavigate, onOpenAi }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/faculty/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const assignedSubjects = data?.assignedSubjects || [];
  const todayClasses = data?.todayClasses || [];
  const assignments = data?.assignments || [];

  const totalStudents = assignedSubjects.reduce((sum: number, s: any) => sum + (s.totalStudents || 68), 0);
  const pendingGrading = assignments.reduce((sum: number, a: any) => sum + (a.pendingCount || 0), 0);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-sky-600 to-blue-600 text-white p-6 sm:p-8 shadow-lg shadow-blue-500/15">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <span>Faculty Portal</span>
            <span>•</span>
            <span>{user?.designation || 'Associate Professor'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
            Welcome, {user?.name}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100 leading-relaxed">
            Department of {user?.departmentName}. You have <strong className="text-white">{todayClasses.length} sessions</strong> scheduled today and <strong className="text-white">{pendingGrading} student submissions</strong> awaiting your evaluation.
          </p>
        </div>

        {/* Quick Actions in Banner */}
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('faculty-attendance')}
            className="px-4 py-2 rounded-xl bg-white text-blue-900 font-bold text-xs shadow-md hover:bg-blue-50 transition-all flex items-center gap-1.5"
          >
            <ClipboardCheck className="w-4 h-4 text-blue-600" />
            <span>Mark Today&apos;s Attendance</span>
          </button>
          <button
            onClick={() => onNavigate('faculty-assignments')}
            className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Students</span>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalStudents || 68}
            </span>
            <span className="text-xs text-slate-400 font-medium">Enrolled</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Across {assignedSubjects.length} courses</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Classes Today</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {todayClasses.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Lectures</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Next: {todayClasses[0]?.subjectCode || 'None scheduled today'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Evaluation</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {pendingGrading || 2}
            </span>
            <span className="text-xs text-slate-400 font-medium">Submissions</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Require scoring & feedback</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Average Attendance</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              88.4%
            </span>
            <span className="text-[11px] font-bold text-emerald-600">Strong</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Eligible cohort aggregate</p>
        </div>
      </div>

      {/* Main Row: Today's Lectures + Assigned Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Lectures */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Today&apos;s Teaching Schedule
            </h2>
            <button
              onClick={() => onNavigate('faculty-attendance')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Mark Attendance
            </button>
          </div>

          {todayClasses.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No lectures scheduled for your courses today.
            </div>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((c: any, i: number) => (
                <div
                  key={c._id || i}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300">
                          {c.subjectCode}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {c.subjectName}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Room: <strong className="text-slate-700 dark:text-slate-300">{c.room}</strong> · {c.startTime} - {c.endTime}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('faculty-attendance')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    Roster
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Courses */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Assigned Courses & Subjects
            </h2>
            <button
              onClick={() => onNavigate('faculty-marks')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Manage Marks
            </button>
          </div>

          <div className="space-y-3">
            {assignedSubjects.map((sub: any) => (
              <div
                key={sub._id}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
                      {sub.code}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {sub.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Semester {sub.semester} · {sub.credits} Academic Credits · {sub.totalClasses} Total Sessions
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onNavigate('faculty-attendance')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
                  >
                    Attendance
                  </button>
                  <button
                    onClick={() => onNavigate('faculty-marks')}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100"
                  >
                    Marks
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
