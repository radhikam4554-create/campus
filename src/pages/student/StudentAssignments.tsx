import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Calendar,
  Award,
  MessageSquare,
  X,
  FileCheck,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';
import { Assignment } from '../../types.js';

export const StudentAssignments: React.FC = () => {
  const toast = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Submitted' | 'Graded'>('All');

  // Submit modal
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('My_Assignment_Report.pdf');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const res = await api.get('/student/assignments');
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = (asg: Assignment) => {
    setSubmittingAssignment(asg);
    setNotes(asg.submission?.notes || '');
    setFileName(asg.submission?.fileName || `${asg.title.replace(/\s+/g, '_')}_Submission.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/student/assignments/${submittingAssignment._id}/submit`, {
        notes,
        fileName,
        fileUrl: `https://campusconnect.edu/uploads/${fileName}`
      });

      if (res.data.success) {
        toast.success('Assignment submitted successfully!');

        // Confetti celebration!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        setSubmittingAssignment(null);
        loadAssignments();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = assignments.filter(a => {
    if (statusFilter === 'All') return true;
    return a.submissionStatus === statusFilter;
  });

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
          Assignments & Submissions
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review deadlines, upload coursework artifacts, and track professor grading
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['All', 'Pending', 'Submitted', 'Graded'] as const).map(tab => {
          const count = tab === 'All' ? assignments.length : assignments.filter(a => a.submissionStatus === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] ${statusFilter === tab ? 'text-indigo-200' : 'text-slate-400'}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No assignments found in &ldquo;{statusFilter}&rdquo; status.
          </div>
        ) : (
          filtered.map(a => {
            const isPending = a.submissionStatus === 'Pending';
            const isGraded = a.submissionStatus === 'Graded';
            const isSubmitted = a.submissionStatus === 'Submitted';

            return (
              <div
                key={a._id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {a.subjectName}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isGraded
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : isSubmitted
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      ● {a.submissionStatus}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {a.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {a.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: <strong className="text-slate-700 dark:text-slate-200">{new Date(a.deadline).toLocaleDateString()}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>Max Marks: <strong className="text-slate-700 dark:text-slate-200">{a.maxMarks}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Faculty: <strong className="text-slate-700 dark:text-slate-200">{a.facultyName}</strong></span>
                    </div>
                  </div>

                  {/* Feedback preview if graded */}
                  {isGraded && a.submission && (
                    <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">
                          Marks Awarded: {a.marksObtained} / {a.maxMarks}
                        </span>
                        <span className="text-[10px] text-emerald-600">Graded</span>
                      </div>
                      {a.submission.feedback && (
                        <p className="text-slate-600 dark:text-slate-300 mt-1 italic">
                          &ldquo;{a.submission.feedback}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenSubmit(a)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                      isPending
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isPending ? <Upload className="w-4 h-4" /> : <FileCheck className="w-4 h-4" />}
                    <span>{isPending ? 'Upload Submission' : 'Update Submission'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submission Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSubmittingAssignment(null)}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Submit Assignment
                </h3>
                <p className="text-xs text-slate-400">
                  {submittingAssignment.subjectName} · {submittingAssignment.title}
                </p>
              </div>
              <button
                onClick={() => setSubmittingAssignment(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Attachment File Name
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="e.g. DBMS_Assignment_CS101.pdf"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <label className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 cursor-pointer hover:bg-indigo-100">
                    Browse
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFileName(e.target.files[0].name);
                        }
                      }}
                    />
                  </label>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Accepted formats: PDF, DOCX, ZIP (Up to 25MB)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Submission Notes / Comments for Professor
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Include any notes, assumptions, or references..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200">
                <p className="font-semibold">Academic Integrity Pledge</p>
                <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                  By submitting this work, you certify that it is your original submission following university standards.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Uploading...' : 'Confirm Submission'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
