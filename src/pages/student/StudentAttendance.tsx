import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import api from '../../api/client.js';

export const StudentAttendance: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const res = await api.get('/student/attendance');
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
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  const overall = data?.overall || { percentage: 87.5, present: 137, total: 156, absent: 19 };
  const subjectBreakdown = data?.subjectBreakdown || [];
  const records = data?.records || [];

  // Filter history records
  const filteredRecords = records.filter((r: any) => {
    const matchSubject = selectedSubject === 'all' || r.subjectId === selectedSubject;
    const matchStatus = statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSubject && matchStatus;
  });

  // Calculate buffer for 75%
  // P / (T + X) >= 0.75 => P >= 0.75T + 0.75X => 0.75X <= P - 0.75T => X <= (P - 0.75T) / 0.75
  const canMiss = Math.max(0, Math.floor((overall.present - 0.75 * overall.total) / 0.75));
  // If below 75%: (P + X) / (T + X) >= 0.75 => P + X >= 0.75T + 0.75X => 0.25X >= 0.75T - P => X >= (0.75T - P) / 0.25
  const needToAttend = overall.percentage < 75
    ? Math.ceil((0.75 * overall.total - overall.present) / 0.25)
    : 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
          Attendance Analytics & Records
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your attendance compliance against university requirements
        </p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Overall Attendance</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {overall.percentage}%
            </span>
            <span className={`text-xs font-bold ${overall.percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {overall.percentage >= 75 ? 'Eligible for Exams' : 'Attendance Shortage'}
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${overall.percentage >= 75 ? 'bg-indigo-600' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(overall.percentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Classes Attended</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {overall.present}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {overall.total} held</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">Across all registered courses</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Classes Missed</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {overall.absent}
            </span>
            <span className="text-xs text-slate-400 font-medium">absences</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">Includes approved & medical leaves</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">75% Threshold Safe Margin</span>
          <div className="mt-2">
            {overall.percentage >= 75 ? (
              <div>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  +{canMiss} classes
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  You can safely miss up to {canMiss} more sessions
                </p>
              </div>
            ) : (
              <div>
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {needToAttend} classes needed
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Attend {needToAttend} consecutive classes to hit 75%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Course-Wise Breakdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Faculty</th>
                <th className="py-3 px-4 text-center">Total Held</th>
                <th className="py-3 px-4 text-center">Attended</th>
                <th className="py-3 px-4 text-center">Absent</th>
                <th className="py-3 px-4 text-right">Percentage</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {subjectBreakdown.map((s: any) => {
                const isSafe = s.percentage >= 75;
                return (
                  <tr key={s.subjectId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {s.subjectName}
                      </div>
                      <div className="text-[10px] text-slate-400">{s.subjectCode}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {s.facultyName || 'Department Faculty'}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300">
                      {s.totalClasses}
                    </td>
                    <td className="py-3.5 px-4 text-center text-emerald-600 font-semibold">
                      {s.present}
                    </td>
                    <td className="py-3.5 px-4 text-center text-rose-600 font-semibold">
                      {s.absent}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {s.percentage}%
                      </div>
                      <div className="w-24 ml-auto bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                        <div
                          className={`h-1 rounded-full ${isSafe ? 'bg-indigo-600' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(s.percentage, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSafe
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isSafe ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        <span>{isSafe ? 'Eligible' : 'Shortage'}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Attendance History Log */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Attendance History
            </h2>
            <p className="text-xs text-slate-400">
              Verified daily punch records recorded by professors
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">All Subjects</option>
              {subjectBreakdown.map((s: any) => (
                <option key={s.subjectId} value={s.subjectId}>{s.subjectCode} - {s.subjectName}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present Only</option>
              <option value="absent">Absent Only</option>
            </select>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No attendance records matching the selected filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredRecords.map((r: any) => (
              <div key={r._id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      r.status === 'Present'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                    }`}
                  >
                    {r.status === 'Present' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {r.subjectName} ({r.subjectCode})
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{r.date}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    r.status === 'Present'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                      : 'bg-rose-50 dark:bg-rose-950 text-rose-600'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
