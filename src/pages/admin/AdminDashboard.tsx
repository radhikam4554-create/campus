import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Award,
  Bell,
  CheckCircle2,
  Plus,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../api/client.js';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
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

  const counts = data?.counts || { totalStudents: 1420, totalFaculty: 98, totalDepartments: 6, totalCourses: 48 };
  const departmentStats = data?.departmentStats || [];
  const attendanceTrends = data?.attendanceTrends || [];
  const recentNotices = data?.recentNotices || [];

  const COLORS = ['#2563eb', '#0ea5e9', '#38bdf8', '#60a5fa', '#10b981', '#f59e0b'];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-900/50">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
            <span>Chief Academic Administration</span>
            <span>•</span>
            <span>Autumn Academic Term 2025</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
            Institutional Governance Dashboard
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Real-time university telemetry spanning <strong className="text-white">{counts.totalStudents.toLocaleString()} enrolled students</strong>, <strong className="text-white">{counts.totalFaculty} faculty</strong>, and <strong className="text-white">{counts.totalDepartments} academic departments</strong>.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('admin-students')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Manage Students</span>
          </button>
          <button
            onClick={() => onNavigate('admin-faculty')}
            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Manage Faculty</span>
          </button>
          <button
            onClick={() => onNavigate('notices')}
            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Bell className="w-4 h-4" />
            <span>Broadcast Notice</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('admin-students')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Enrollment</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {counts.totalStudents.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-emerald-600">↑ +8.4% YoY</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Full-time degree candidates</p>
        </div>

        <div
          onClick={() => onNavigate('admin-faculty')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Teaching Faculty</span>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {counts.totalFaculty}
            </span>
            <span className="text-xs text-slate-400 font-medium">Professors</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">1:14.5 Student-Faculty Ratio</p>
        </div>

        <div
          onClick={() => onNavigate('admin-departments')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Academic Departments</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {counts.totalDepartments}
            </span>
            <span className="text-xs text-slate-400 font-medium">Schools</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">CSE, ECE, ME, CE, AI, Management</p>
        </div>

        <div
          onClick={() => onNavigate('admin-subjects')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Courses</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {counts.totalCourses}
            </span>
            <span className="text-xs text-slate-400 font-medium">Subjects</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Accredited university syllabus</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Line Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Campus-Wide Attendance Trajectory
              </h2>
              <p className="text-xs text-slate-400">
                Monthly average aggregate attendance across all university departments
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
              ● 88.6% Term Avg
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrends} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-100">{payload[0].payload.month}</p>
                          <p className="text-indigo-600 font-bold mt-1">Campus Attendance: {payload[0].value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#4f46e5' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Enrollment Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Enrollment by Department
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Distribution of candidates across academic departments
            </p>

            <div className="space-y-3">
              {departmentStats.map((dep: any, i: number) => {
                const pct = Math.round((dep.students / (counts.totalStudents || 1420)) * 100);
                return (
                  <div key={dep.code}>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-800 dark:text-slate-200">{dep.name}</span>
                      <span className="text-slate-500">{dep.students} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: COLORS[i % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate('admin-departments')}
            className="mt-6 w-full py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
          >
            Manage Department Curricula →
          </button>
        </div>
      </div>

      {/* Broadcast Notices Overview */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Campus Broadcast Announcements
            </h2>
            <p className="text-xs text-slate-400">
              Active university circulars dispatched to student and faculty portals
            </p>
          </div>

          <button
            onClick={() => onNavigate('notices')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Manage All Notices →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentNotices.slice(0, 3).map((notice: any) => (
            <div
              key={notice._id}
              className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                <span className="font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  Target: {notice.targetRole}
                </span>
                <span>{notice.date}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                {notice.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {notice.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
