import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  Save,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';

interface StudentRosterItem {
  studentId: string;
  name: string;
  rollNumber: string;
  collegeId: string;
  status: 'Present' | 'Absent';
}

export const FacultyAttendance: React.FC = () => {
  const toast = useToast();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState<StudentRosterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await api.get('/faculty/subjects');
      if (res.data.success && res.data.data.length > 0) {
        setSubjects(res.data.data);
        setSelectedSubjectId(res.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubjectId) {
      loadRoster();
    }
  }, [selectedSubjectId, date]);

  const loadRoster = async () => {
    try {
      const res = await api.get(`/faculty/attendance/${selectedSubjectId}?date=${date}`);
      if (res.data.success) {
        setRoster(res.data.data.students);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = (studentId: string) => {
    setRoster(prev =>
      prev.map(s => {
        if (s.studentId === studentId) {
          return {
            ...s,
            status: s.status === 'Present' ? 'Absent' : 'Present'
          };
        }
        return s;
      })
    );
  };

  const handleMarkAll = (status: 'Present' | 'Absent') => {
    setRoster(prev => prev.map(s => ({ ...s, status })));
    toast.info(`Marked all students as ${status}.`);
  };

  const handleSaveAttendance = async () => {
    if (!selectedSubjectId || roster.length === 0) return;

    setSaving(true);
    try {
      const records = roster.map(s => ({
        studentId: s.studentId,
        status: s.status
      }));

      const res = await api.post(`/faculty/attendance/${selectedSubjectId}`, {
        date,
        records
      });

      if (res.data.success) {
        toast.success(`Attendance successfully recorded for ${roster.length} students!`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record attendance.');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = roster.filter(s => s.status === 'Present').length;
  const absentCount = roster.length - presentCount;
  const percentage = roster.length > 0 ? ((presentCount / roster.length) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Class Attendance Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Conduct daily roll call and sync authenticated session logs
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || roster.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save & Publish Attendance'}</span>
        </button>
      </div>

      {/* Control Filters Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Subject Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Select Course
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
            >
              {subjects.map(s => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name} (Sem {s.semester})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Session Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quick Batch Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => handleMarkAll('Present')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('Absent')}
            className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Real-time Session Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Total Enrolled</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">{roster.length} Students</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Present in Class</span>
          <span className="text-lg font-bold text-emerald-600">{presentCount} ({percentage}%)</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Absent / Excused</span>
          <span className="text-lg font-bold text-rose-600">{absentCount}</span>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">College ID</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {roster.map(student => {
                const isPresent = student.status === 'Present';
                return (
                  <tr
                    key={student.studentId}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {student.rollNumber || 'CS-01'}
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                      {student.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {student.collegeId}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          isPresent
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {isPresent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{student.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(student.studentId)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                          isPresent
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {isPresent ? 'Mark Absent' : 'Mark Present'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
