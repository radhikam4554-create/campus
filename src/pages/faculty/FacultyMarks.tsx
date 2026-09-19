import React, { useState, useEffect } from 'react';
import {
  Award,
  Save,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Users,
  TrendingUp,
  Percent,
  Sparkles,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';

interface StudentMarkRow {
  studentId: string;
  name: string;
  rollNumber: string;
  collegeId: string;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
  gradePoints: number;
  isPassing?: boolean;
}

interface ClassStats {
  totalStudents: number;
  gradedCount: number;
  classAverage: number;
  highestMark: number;
  passRate: number;
}

export const FacultyMarks: React.FC = () => {
  const toast = useToast();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [subjectInfo, setSubjectInfo] = useState<any>(null);
  const [rows, setRows] = useState<StudentMarkRow[]>([]);
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'graded' | 'pending' | 'at-risk'>('all');

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
      toast.error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubjectId) {
      loadMarks();
    }
  }, [selectedSubjectId]);

  const loadMarks = async () => {
    try {
      const res = await api.get(`/faculty/marks/${selectedSubjectId}`);
      if (res.data.success) {
        const studentList: StudentMarkRow[] = res.data.data.students || [];
        setRows(studentList);
        setSubjectInfo(res.data.data.subject);
        setStats(res.data.data.stats || null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student mark entries.');
    }
  };

  const calculateGrade = (internal: number, external: number): { grade: string; points: number } => {
    const total = internal + external;
    if (external < 28 || total < 40) return { grade: 'F', points: 0 };
    if (total >= 90) return { grade: 'A+', points: 10 };
    if (total >= 80) return { grade: 'A', points: 9 };
    if (total >= 70) return { grade: 'B+', points: 8 };
    if (total >= 60) return { grade: 'B', points: 7 };
    if (total >= 50) return { grade: 'C', points: 6 };
    return { grade: 'P', points: 5 };
  };

  const handleMarkChange = (studentId: string, field: 'internal' | 'external', val: number) => {
    setRows(prev =>
      prev.map(r => {
        if (r.studentId === studentId) {
          const internal = field === 'internal' ? Math.min(30, Math.max(0, val)) : r.internalMarks;
          const external = field === 'external' ? Math.min(70, Math.max(0, val)) : r.externalMarks;
          const total = internal + external;
          const { grade, points } = calculateGrade(internal, external);
          const isPassing = total >= 40 && external >= 28;

          return {
            ...r,
            internalMarks: internal,
            externalMarks: external,
            totalMarks: total,
            grade,
            gradePoints: points,
            isPassing
          };
        }
        return r;
      })
    );
  };

  const handleAutoFillInternals = (presetVal: number) => {
    setRows(prev =>
      prev.map(r => {
        const internal = presetVal;
        const external = r.externalMarks;
        const total = internal + external;
        const { grade, points } = calculateGrade(internal, external);
        return {
          ...r,
          internalMarks: internal,
          totalMarks: total,
          grade,
          gradePoints: points,
          isPassing: total >= 40 && external >= 28
        };
      })
    );
    toast.success(`Set continuous assessment to ${presetVal}/30 for all students.`);
  };

  const handleSaveMarks = async () => {
    if (!selectedSubjectId) return;

    setSaving(true);
    try {
      const payload = rows.map(r => ({
        studentId: r.studentId,
        internalMarks: r.internalMarks,
        externalMarks: r.externalMarks
      }));

      const res = await api.post(`/faculty/marks/${selectedSubjectId}`, {
        marks: payload
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Marks published successfully to university registrar!');
        loadMarks();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update marks.');
    } finally {
      setSaving(false);
    }
  };

  // Filter rows
  const filteredRows = rows.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.collegeId.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'graded') return r.totalMarks > 0;
    if (filterStatus === 'pending') return r.totalMarks === 0;
    if (filterStatus === 'at-risk') return r.totalMarks > 0 && (!r.isPassing || r.totalMarks < 50);

    return true;
  });

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              Examination & Grading Module
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Semester Continuous Evaluation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Marks & Grade Entry Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Evaluate continuous internal assessments (Max 30) and university end-semester examinations (Max 70)
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={loadMarks}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
            title="Reload student list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleSaveMarks}
            disabled={saving || rows.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing Marks...' : 'Save & Publish Marks'}</span>
          </button>
        </div>
      </div>

      {/* Course Selection & Quick Actions Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Active Course
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {subjects.map(s => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name} (Semester {s.semester}, {s.credits || 4} Credits)
                </option>
              ))}
            </select>
          </div>

          {subjectInfo && (
            <div className="sm:border-l sm:border-slate-200 dark:sm:border-slate-700 sm:pl-3 pt-2 sm:pt-4 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Department:</span> {subjectInfo.departmentName || 'Computer Science'}
            </div>
          )}
        </div>

        {/* Preset Helper Tools */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[11px] font-bold text-slate-400">Quick Fill Internals:</span>
          <button
            onClick={() => handleAutoFillInternals(25)}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold hover:bg-indigo-100 transition-colors"
          >
            Fill 25/30
          </button>
          <button
            onClick={() => handleAutoFillInternals(28)}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
          >
            Fill 28/30
          </button>
        </div>
      </div>

      {/* Class Statistics KPIs */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Students</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-display">
                {stats.totalStudents}
              </span>
              <span className="text-[11px] text-indigo-600 font-semibold">
                ({stats.gradedCount} graded)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Average Score</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-display">
                {stats.classAverage}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Highest Total Mark</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display">
                {stats.highestMark}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Pass Rate</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display">
                {stats.passRate}%
              </span>
              <span className="text-[10px] text-slate-400">(Min 40%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          {(['all', 'graded', 'pending', 'at-risk'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filterStatus === tab
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab === 'at-risk' ? 'At Risk (<50%)' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Marks Entry Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Reg ID</th>
                <th className="py-3 px-4 text-center">Internal (Max 30)</th>
                <th className="py-3 px-4 text-center">External (Max 70)</th>
                <th className="py-3 px-4 text-center font-bold">Total (100)</th>
                <th className="py-3 px-4 text-center">Letter Grade</th>
                <th className="py-3 px-4 text-center">Grade Points</th>
                <th className="py-3 px-4 text-center">Pass / Fail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredRows.map(r => (
                <tr key={r.studentId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {r.rollNumber || 'CS101'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {r.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-medium">
                    {r.collegeId || 'CS2024001'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={r.internalMarks}
                      onChange={(e) => handleMarkChange(r.studentId, 'internal', Number(e.target.value))}
                      className="w-16 px-2.5 py-1.5 text-center font-black text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-indigo-600 dark:text-indigo-400 focus:border-indigo-500"
                    />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="number"
                      min="0"
                      max="70"
                      value={r.externalMarks}
                      onChange={(e) => handleMarkChange(r.studentId, 'external', Number(e.target.value))}
                      className="w-16 px-2.5 py-1.5 text-center font-black text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-violet-600 dark:text-violet-400 focus:border-violet-500"
                    />
                  </td>
                  <td className="py-3.5 px-4 text-center font-black text-sm text-slate-900 dark:text-white">
                    {r.totalMarks}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-lg font-black text-xs ${
                      r.grade.startsWith('A') || r.grade === 'O'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : r.grade.startsWith('B')
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        : r.grade === 'F'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {r.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                    {r.gradePoints}.0
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {r.totalMarks === 0 ? (
                      <span className="text-[11px] text-slate-400 font-semibold">Unmarked</span>
                    ) : r.isPassing ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pass</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Arrear (F)</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRows.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No student records match the search or filter criteria.
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredRows.length} of {rows.length} enrolled students</span>
          <span className="hidden sm:inline">Changes are published immediately to student portals upon saving</span>
        </div>
      </div>
    </div>
  );
};
