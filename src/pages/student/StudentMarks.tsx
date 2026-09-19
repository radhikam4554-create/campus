import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  Download,
  Printer,
  Calendar,
  BookOpen,
  Info,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';

interface MarkRecord {
  _id: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  credits: number;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
  gradePoints: number;
}

interface SgpaHistoryItem {
  semester: number;
  label: string;
  sgpa: number;
  credits: number;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  status: string;
}

interface MarksData {
  studentInfo: {
    _id: string;
    name: string;
    rollNumber: string;
    collegeId: string;
    department: string;
    batch: string;
    degree: string;
    academicYear: string;
  };
  currentSemester: number;
  selectedSemester: number;
  availableSemesters: number[];
  sgpa: number;
  cgpa: number;
  totalCredits: number;
  cumulativeCredits: number;
  totalDegreeCredits: number;
  percentageEquivalent: number;
  resultStatus: string;
  records: MarkRecord[];
  performanceDistribution: any[];
  sgpaHistory: SgpaHistoryItem[];
  gradeDistribution: Record<string, number>;
}

export const StudentMarks: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<MarksData | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number>(user?.semester || 5);
  const [activeTab, setActiveTab] = useState<'distribution' | 'trend'>('distribution');
  const [showGradingScale, setShowGradingScale] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarks(selectedSemester);
  }, [selectedSemester]);

  const loadMarks = async (sem: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/student/marks?semester=${sem}`);
      if (res.data.success && res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load marks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !data) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  const studentInfo = data?.studentInfo || {
    name: user?.name || 'Student',
    rollNumber: user?.rollNumber || 'CS101',
    collegeId: user?.collegeId || 'CS2024001',
    department: user?.departmentName || 'Computer Science & Engineering',
    batch: '2023-2027',
    degree: 'Bachelor of Technology (B.Tech)',
    academicYear: '2025-2026'
  };

  const records: MarkRecord[] = data?.records || [];
  const currentSemester = data?.currentSemester || 5;
  const sgpa = data?.sgpa ?? 8.8;
  const cgpa = data?.cgpa ?? (user?.cgpa || 8.7);
  const totalCredits = data?.totalCredits || 16;
  const cumulativeCredits = data?.cumulativeCredits || 90;
  const percentage = data?.percentageEquivalent || Number((cgpa * 9.5).toFixed(1));
  const availableSemesters = data?.availableSemesters || [1, 2, 3, 4, 5];
  const sgpaHistory = data?.sgpaHistory || [];

  // Stacked chart data
  const chartData = records.map(m => ({
    code: m.subjectCode,
    name: m.subjectName,
    internal: m.internalMarks,
    external: m.externalMarks,
    total: m.totalMarks,
    grade: m.grade,
    credits: m.credits || 4
  }));

  const totalCreditPoints = records.reduce((sum, r) => sum + (r.credits * r.gradePoints), 0);
  const passedAll = records.every(r => r.totalMarks >= 40 && r.externalMarks >= 28);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto print:p-2 print:m-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              Official University Transcript
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              10-Point Relative Grading System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Marks & Academic Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Certified semester grade cards, continuous assessment evaluations, and cumulative GPA records
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowGradingScale(!showGradingScale)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Info className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">Grading Scale</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Marksheet</span>
          </button>
        </div>
      </div>

      {/* Grading Scale Modal / Collapsible */}
      {showGradingScale && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 shadow-md animate-in fade-in slide-in-from-top-2 duration-200 print:hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                University 10-Point UGC Grading Scale Reference
              </h3>
            </div>
            <button
              onClick={() => setShowGradingScale(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="block font-black text-emerald-700 dark:text-emerald-400 text-sm">O</span>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold">Outstanding</span>
              <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">90 - 100</span>
              <span className="text-[10px] text-slate-400">10.0 GP</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/40">
              <span className="block font-black text-indigo-700 dark:text-indigo-400 text-sm">A+</span>
              <span className="text-[10px] text-indigo-800 dark:text-indigo-300 font-semibold">Excellent</span>
              <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">80 - 89</span>
              <span className="text-[10px] text-slate-400">9.0 GP</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/40">
              <span className="block font-black text-blue-700 dark:text-blue-400 text-sm">A</span>
              <span className="text-[10px] text-blue-800 dark:text-blue-300 font-semibold">Very Good</span>
              <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">70 - 79</span>
              <span className="text-[10px] text-slate-400">8.0 GP</span>
            </div>
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200/50 dark:border-violet-800/40">
              <span className="block font-black text-violet-700 dark:text-violet-400 text-sm">B+</span>
              <span className="text-[10px] text-violet-800 dark:text-violet-300 font-semibold">Good</span>
              <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">60 - 69</span>
              <span className="text-[10px] text-slate-400">7.0 GP</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/40">
              <span className="block font-black text-purple-700 dark:text-purple-400 text-sm">B</span>
              <span className="text-[10px] text-purple-800 dark:text-purple-300 font-semibold">Above Avg</span>
              <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">55 - 59</span>
              <span className="text-[10px] text-slate-400">6.0 GP</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/40">
              <span className="block font-black text-amber-700 dark:text-amber-400 text-sm">C</span>
              <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold">Average</span>
              <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">50 - 54</span>
              <span className="text-[10px] text-slate-400">6.0 GP</span>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/50 dark:border-orange-800/40">
              <span className="block font-black text-orange-700 dark:text-orange-400 text-sm">P</span>
              <span className="text-[10px] text-orange-800 dark:text-orange-300 font-semibold">Pass</span>
              <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">40 - 49</span>
              <span className="text-[10px] text-slate-400">5.0 GP</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/50 dark:border-rose-800/40">
              <span className="block font-black text-rose-700 dark:text-rose-400 text-sm">F</span>
              <span className="text-[10px] text-rose-800 dark:text-rose-300 font-semibold">Fail/Arrear</span>
              <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">&lt; 40</span>
              <span className="text-[10px] text-slate-400">0.0 GP</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
            * <strong>Passing Rule:</strong> A minimum of 40% aggregate total mark AND minimum 40% in external university examinations (28/70) is mandatory to clear a course.
          </p>
        </div>
      )}

      {/* Semester Archive Selector Pills */}
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between overflow-x-auto print:hidden">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3">
            Semester Archive:
          </span>
          {availableSemesters.map(sem => {
            const isSelected = selectedSemester === sem;
            const isCurrent = sem === currentSemester;
            return (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Semester {sem}</span>
                {isCurrent && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    Current
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2 pr-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Results Verified & Published</span>
        </div>
      </div>

      {/* Academic Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        {/* Cumulative CGPA */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cumulative CGPA</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 font-display">
              {cgpa.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 10.0</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              First Class with Distinction
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Across {cumulativeCredits} completed credit units</p>
        </div>

        {/* Selected Semester SGPA */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Semester {selectedSemester} SGPA
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-display">
              {sgpa.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 10.0</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              {totalCredits} Semester Credits
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              {totalCreditPoints} Grade Points
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Semester performance index</p>
        </div>

        {/* Total Credits & Degree Progress */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Degree Credits Earned</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
              {cumulativeCredits}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 160 credits</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((cumulativeCredits / 160) * 100))}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">
            {Math.round((cumulativeCredits / 160) * 100)}% of graduation degree requirements cleared
          </p>
        </div>

        {/* UGC Equivalent Percentage & Result */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aggregate Equivalent</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 font-display">
              {percentage}%
            </span>
            <span className="text-xs text-slate-400 font-semibold">AICTE/UGC</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {passedAll ? 'Status: ALL CLEARED' : 'Status: UNDER EVALUATION'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Formula: Percentage = CGPA × 9.5</p>
        </div>
      </div>

      {/* Visual Analytics Tabs (Internal vs External & SGPA Trend) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Performance Visualizer & Analytics
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative analysis of continuous internal evaluations and semester examination marks
            </p>
          </div>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('distribution')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'distribution'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Semester {selectedSemester} Subject Marks
            </button>
            <button
              onClick={() => setActiveTab('trend')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'trend'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Semester-by-Semester SGPA Trajectory
            </button>
          </div>
        </div>

        {activeTab === 'distribution' ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.12} />
                <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {d.code}: {d.name}
                          </p>
                          <p className="text-slate-400 text-[11px]">Credits: {d.credits} • Grade: {d.grade}</p>
                          <div className="pt-1 border-t border-slate-100 dark:border-slate-700/60 space-y-0.5">
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                              Internal: {d.internal} / 30
                            </p>
                            <p className="text-violet-600 dark:text-violet-400 font-semibold">
                              External: {d.external} / 70
                            </p>
                            <p className="text-emerald-600 dark:text-emerald-400 font-black">
                              Total Score: {d.total} / 100
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="internal" name="Continuous Internal Assessment (Max 30)" fill="#6366f1" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="external" name="University End-Semester Exam (Max 70)" fill="#a855f7" stackId="a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sgpaHistory} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.12} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[7.0, 10.0]} tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-xs">
                          <p className="font-extrabold text-slate-900 dark:text-white">{d.label}</p>
                          <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-1 text-sm">
                            SGPA: {d.sgpa.toFixed(2)} / 10.0
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            Credits: {d.credits} • Aggregate: {d.percentage}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={cgpa} label={`Cumulative CGPA: ${cgpa.toFixed(2)}`} stroke="#6366f1" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="sgpa"
                  name="Semester SGPA"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Official Grade Card / Marksheet (Fully Printable) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden print:border-none print:shadow-none print:p-0">
        {/* Printable University Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                C
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                  CAMPUSCONNECT UNIVERSITY
                </h2>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Office of the Controller of Examinations • Grade Statement
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right text-xs space-y-0.5 text-slate-500 dark:text-slate-400">
              <p><strong className="text-slate-800 dark:text-slate-200">Session:</strong> Autumn Semester 2025-26</p>
              <p><strong className="text-slate-800 dark:text-slate-200">Date Issued:</strong> September 18, 2025</p>
              <p className="text-[10px] text-slate-400">Doc Ref: CC-TR-{studentInfo.rollNumber}-S{selectedSemester}</p>
            </div>
          </div>

          {/* Student Credentials Summary */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Student Name</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-100">{studentInfo.name}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Roll Number / Reg ID</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-100">{studentInfo.rollNumber} / {studentInfo.collegeId}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Degree Program</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-100">{studentInfo.degree}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Department</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-100">{studentInfo.department}</span>
            </div>
          </div>
        </div>

        {/* Detailed Marksheet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-3 text-center">Credits (C)</th>
                <th className="py-3 px-3 text-center">Internal (30)</th>
                <th className="py-3 px-3 text-center">External (70)</th>
                <th className="py-3 px-3 text-center font-bold">Total (100)</th>
                <th className="py-3 px-3 text-center">Letter Grade</th>
                <th className="py-3 px-3 text-center">Grade Point (G)</th>
                <th className="py-3 px-3 text-center font-bold">Credit Points (C×G)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {records.map(record => {
                const creditPoints = (record.credits || 4) * record.gradePoints;
                const isPassed = record.totalMarks >= 40 && record.externalMarks >= 28;
                return (
                  <tr key={record._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-extrabold text-indigo-600 dark:text-indigo-400">
                      {record.subjectCode}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {record.subjectName}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                      {record.credits || 4}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-300 font-semibold">
                      {record.internalMarks}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-300 font-semibold">
                      {record.externalMarks}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-slate-900 dark:text-white">
                      {record.totalMarks}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-black text-xs ${
                        record.grade.startsWith('A') || record.grade === 'O'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/40 dark:border-emerald-800/40'
                          : record.grade.startsWith('B')
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/40 dark:border-indigo-800/40'
                          : record.grade === 'F'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/40 dark:border-rose-800/40'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/40 dark:border-amber-800/40'
                      }`}>
                        {record.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                      {record.gradePoints.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-indigo-600 dark:text-indigo-400">
                      {creditPoints.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        <span>{isPassed ? 'PASSED' : 'REAPPEAR'}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white">
                <td colSpan={2} className="py-3 px-4 uppercase text-[11px] tracking-wider">
                  Semester {selectedSemester} Summary Totals
                </td>
                <td className="py-3 px-3 text-center text-indigo-600 dark:text-indigo-400 font-extrabold">
                  {totalCredits}
                </td>
                <td className="py-3 px-3 text-center text-slate-500">
                  {records.reduce((a, b) => a + b.internalMarks, 0)}
                </td>
                <td className="py-3 px-3 text-center text-slate-500">
                  {records.reduce((a, b) => a + b.externalMarks, 0)}
                </td>
                <td className="py-3 px-3 text-center font-black">
                  {records.reduce((a, b) => a + b.totalMarks, 0)} / {records.length * 100}
                </td>
                <td className="py-3 px-3 text-center text-slate-400">—</td>
                <td className="py-3 px-3 text-center text-slate-400">—</td>
                <td className="py-3 px-3 text-center text-indigo-600 dark:text-indigo-400 font-black">
                  {totalCreditPoints.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-center text-emerald-600 dark:text-emerald-400 font-black">
                  {passedAll ? 'PASS' : 'FAIL'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Marksheet Footer / Signatures */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
          <div className="flex flex-col items-center justify-end h-20">
            <div className="w-32 border-b border-dashed border-slate-400 mb-2" />
            <span className="font-bold text-slate-800 dark:text-slate-200">Prof. Sunita Rao</span>
            <span className="text-[10px] text-slate-400">Dean of Academics & Registrar</span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-indigo-400/40 flex items-center justify-center p-1">
              <div className="w-full h-full rounded-full border border-indigo-500 flex items-center justify-center text-[8px] font-black text-indigo-600 uppercase text-center leading-tight">
                Official<br />Campus<br />Seal
              </div>
            </div>
            <span className="text-[9px] text-slate-400 mt-2">Computer Generated Valid Transcript</span>
          </div>

          <div className="flex flex-col items-center justify-end h-20">
            <div className="w-32 border-b border-dashed border-slate-400 mb-2" />
            <span className="font-bold text-slate-800 dark:text-slate-200">Dr. Rajesh Kulkarni</span>
            <span className="text-[10px] text-slate-400">Controller of Examinations</span>
          </div>
        </div>
      </div>
    </div>
  );
};
