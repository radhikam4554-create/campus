import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  Users,
  Award,
  CheckCircle2,
  Clock,
  X,
  Send,
  Eye,
  MessageSquare
} from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';
import { Assignment, Submission } from '../../types.js';

export const FacultyAssignments: React.FC = () => {
  const toast = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Assignment Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [targetSemester, setTargetSemester] = useState(5);
  const [creating, setCreating] = useState(false);

  // Submissions Modal
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Grade Modal
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [marksObtained, setMarksObtained] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    loadAssignments();
    loadSubjects();
  }, []);

  const loadAssignments = async () => {
    try {
      const res = await api.get('/faculty/assignments');
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await api.get('/faculty/subjects');
      if (res.data.success && res.data.data.length > 0) {
        setSubjects(res.data.data);
        setSubjectId(res.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId || !deadline) {
      toast.error('Please fill all required fields.');
      return;
    }

    setCreating(true);
    try {
      const res = await api.post('/faculty/assignments', {
        title: title.trim(),
        description: description.trim(),
        subjectId,
        deadline,
        maxMarks: Number(maxMarks),
        targetSemester: Number(targetSemester)
      });

      if (res.data.success) {
        toast.success('Assignment created and published to students!');
        setCreateModalOpen(false);
        setTitle('');
        setDescription('');
        loadAssignments();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenSubmissions = async (asg: Assignment) => {
    setActiveAssignment(asg);
    setSubmissionsLoading(true);
    try {
      const res = await api.get(`/faculty/assignments/${asg._id}/submissions`);
      if (res.data.success) {
        setSubmissions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleOpenGradeModal = (sub: Submission) => {
    setGradingSubmission(sub);
    setMarksObtained(sub.marksObtained !== undefined ? sub.marksObtained : 85);
    setFeedback(sub.feedback || 'Good effort. Solid structure and implementation.');
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    setGrading(true);
    try {
      const res = await api.post(`/faculty/submissions/${gradingSubmission._id}/grade`, {
        marksObtained: Number(marksObtained),
        feedback: feedback.trim()
      });

      if (res.data.success) {
        toast.success(`Marks recorded for ${gradingSubmission.studentName}!`);
        setGradingSubmission(null);
        if (activeAssignment) {
          handleOpenSubmissions(activeAssignment);
        }
        loadAssignments();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record grade.');
    } finally {
      setGrading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            Course Assignments & Grading
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create coursework tasks, inspect student submissions, and return grades with feedback
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Assignment</span>
        </button>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          No assignments published yet. Click &ldquo;Create New Assignment&rdquo; to post your first task.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map(asg => (
            <div
              key={asg._id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {asg.subjectName}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Max {asg.maxMarks} Marks
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {asg.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                  {asg.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due: {new Date(asg.deadline).toLocaleDateString()}</span>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    Sem {asg.targetSemester}
                  </span>
                </div>

                {/* Submissions stats pill */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                    <span className="block text-slate-400 text-[10px]">Submitted</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{asg.submissionCount || 1}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                    <span className="block text-slate-400 text-[10px]">Graded</span>
                    <span className="font-bold text-emerald-600">{asg.gradedCount || 0}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenSubmissions(asg)}
                className="mt-5 w-full py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View & Grade Submissions</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setCreateModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Create Course Assignment
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Relational Query Optimization & Indexing"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course / Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100"
                  >
                    {subjects.map(s => (
                      <option key={s._id} value={s._id}>{s.code} - {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Submission Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Semester
                  </label>
                  <select
                    value={targetSemester}
                    onChange={(e) => setTargetSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Instructions & Requirements
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain problem statement, deliverables, and evaluation criteria..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/25"
                >
                  {creating ? 'Publishing...' : 'Publish to Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Viewer Modal */}
      {activeAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setActiveAssignment(null)}
          />

          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Submissions for &ldquo;{activeAssignment.title}&rdquo;
                </h3>
                <p className="text-xs text-slate-400">
                  {activeAssignment.subjectName} · Max Marks: {activeAssignment.maxMarks}
                </p>
              </div>
              <button onClick={() => setActiveAssignment(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              {submissionsLoading ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  Loading student submissions...
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No submissions have been uploaded for this assignment yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {submissions.map(sub => (
                    <div key={sub._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {sub.studentName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            ({sub.studentRoll})
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              sub.status === 'Graded'
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                                : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
                            }`}
                          >
                            ● {sub.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-1">
                          File: <span className="font-mono text-indigo-600 dark:text-indigo-400">{sub.fileName || 'submission.pdf'}</span> · Submitted on {new Date(sub.submissionDate).toLocaleDateString()}
                        </p>

                        {sub.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                            &ldquo;{sub.notes}&rdquo;
                          </p>
                        )}

                        {sub.status === 'Graded' && (
                          <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                            Marks: {sub.marksObtained} / {activeAssignment.maxMarks} · Feedback: {sub.feedback}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenGradeModal(sub)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shrink-0 self-start sm:self-center"
                      >
                        {sub.status === 'Graded' ? 'Edit Grade' : 'Score & Grade'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grade Submission Drawer */}
      {gradingSubmission && activeAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setGradingSubmission(null)}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Grade Submission: {gradingSubmission.studentName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Roll: {gradingSubmission.studentRoll} · Max Marks: {activeAssignment.maxMarks}
            </p>

            <form onSubmit={handleSaveGrade} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Marks Obtained (out of {activeAssignment.maxMarks})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={activeAssignment.maxMarks}
                  value={marksObtained}
                  onChange={(e) => setMarksObtained(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Faculty Feedback Comments
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback for the student..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grading}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/25"
                >
                  {grading ? 'Recording...' : 'Save Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
