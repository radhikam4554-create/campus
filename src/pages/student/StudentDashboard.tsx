import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Award,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../../context/AuthContext.js';
import api from '../../api/client.js';

interface StudentDashboardProps {
  onNavigate: (view: string) => void;
  onOpenAi: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, onOpenAi }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/student/dashboard');
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
      <div className="p-6 md:p-8 space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl lg:col-span-2" />
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const attendance = data?.attendance || { overallPercentage: 87.5, present: 137, total: 156, subjectBreakdown: [] };
  const todayClasses = data?.todayClasses || [];
  const upcomingAssignments = data?.upcomingAssignments || [];
  const marks = data?.marks || [];
  const notices = data?.notices || [];

  const chartData = (attendance.subjectBreakdown || []).map((s: any) => ({
    name: s.subjectCode,
    fullName: s.subjectName,
    percentage: s.percentage,
    present: s.present,
    total: s.totalClasses
  }));

  const isAttendanceSafe = attendance.overallPercentage >= 75;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white p-6 sm:p-8 shadow-lg shadow-blue-500/15">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <span>Semester {user?.semester || 5}</span>
            <span>•</span>
            <span>{user?.departmentName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
            Good day, {user?.name} 👋
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100 leading-relaxed">
            You have <strong className="text-white">{todayClasses.length} lectures</strong> scheduled today and <strong className="text-white">{upcomingAssignments.length} pending assignments</strong>. Your current attendance stands at <strong className="text-white">{attendance.overallPercentage}%</strong>.
          </p>
        </div>

        {/* Quick Assistant Callout */}
        <button
          onClick={onOpenAi}
          className="mt-4 sm:mt-0 sm:absolute sm:right-8 sm:bottom-8 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-blue-900 font-bold text-xs shadow-lg hover:bg-blue-50 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-violet-600 animate-pulse" />
          <span>Ask CampusConnect AI</span>
        </button>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance KPI */}
        <div
          onClick={() => onNavigate('attendance')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Overall Attendance
            </span>
            <div className={`p-2 rounded-xl ${isAttendanceSafe ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {attendance.overallPercentage}%
            </span>
            <span className={`text-[11px] font-bold ${isAttendanceSafe ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isAttendanceSafe ? 'Above 75% threshold' : 'Below 75% threshold'}
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${isAttendanceSafe ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(attendance.overallPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* CGPA KPI */}
        <div
          onClick={() => onNavigate('marks')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Cumulative CGPA
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {user?.cgpa || '8.7'}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 10.0</span>
            <span className="text-[11px] font-bold text-emerald-600">Top 10%</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Rank 4 of 68 in CSE Section A
          </p>
        </div>

        {/* Pending Assignments KPI */}
        <div
          onClick={() => onNavigate('assignments')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Assignments
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {upcomingAssignments.length}
            </span>
            <span className="text-[11px] font-bold text-amber-600">Due this week</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Next due in 3 days (DBMS)
          </p>
        </div>

        {/* Classes Today KPI */}
        <div
          onClick={() => onNavigate('timetable')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Classes Scheduled Today
            </span>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {todayClasses.length}
            </span>
            <span className="text-[11px] text-slate-400">Lectures</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Next: {todayClasses[0]?.subjectCode || 'DBMS'} at {todayClasses[0]?.startTime || '09:00 AM'}
          </p>
        </div>
      </div>

      {/* Main Grid: Subject Attendance Chart + Today's Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-Wise Attendance Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Subject Attendance Breakdown
              </h2>
              <p className="text-xs text-slate-400">
                Minimum university requirement is 75% for exam admit card
              </p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-100">{d.fullName} ({d.name})</p>
                          <p className="text-indigo-600 font-semibold mt-1">Attendance: {d.percentage}%</p>
                          <p className="text-slate-400 text-[10px]">{d.present} of {d.total} sessions attended</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="percentage"
                  fill="#4f46e5"
                  radius={[8, 8, 0, 0]}
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Schedule Timeline */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Today&apos;s Classes
            </h2>
            <button
              onClick={() => onNavigate('timetable')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Timetable
            </button>
          </div>

          {todayClasses.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 text-center py-10">
              No classes scheduled for today. Enjoy your study break!
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {todayClasses.map((c: any, i: number) => (
                <div
                  key={c._id || i}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {c.subjectName}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100/60 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                        {c.room}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {c.facultyName}
                    </p>
                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                      {c.startTime} – {c.endTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lower Row: Upcoming Assignments + Latest Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignments */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Upcoming Assignments
              </h2>
              <p className="text-xs text-slate-400">Coursework requiring your submission</p>
            </div>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              All Assignments
            </button>
          </div>

          <div className="space-y-3">
            {upcomingAssignments.slice(0, 3).map((a: any) => (
              <div
                key={a._id}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {a.subjectName}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                    {a.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Deadline: {new Date(a.deadline).toLocaleDateString()} · Max {a.maxMarks} Marks
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('assignments')}
                  className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
                >
                  Submit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notices */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Campus Notices
              </h2>
              <p className="text-xs text-slate-400">Official circulars & notifications</p>
            </div>
            <button
              onClick={() => onNavigate('notices')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              All Notices
            </button>
          </div>

          <div className="space-y-3">
            {notices.slice(0, 3).map((n: any) => (
              <div
                key={n._id}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      n.priority === 'High'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {n.priority} Priority
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.date).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                  {n.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {n.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
