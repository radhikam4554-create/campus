import { Router } from 'express';
import {
  getFacultyDashboard,
  getFacultySubjects,
  getSubjectAttendance,
  saveSubjectAttendance,
  getFacultyNotes,
  createFacultyNote,
  deleteFacultyNote,
  getSubjectMarks,
  updateSubjectMarks,
  getFacultyAssignments,
  createFacultyAssignment,
  getAssignmentSubmissions,
  gradeSubmission
} from '../controllers/facultyController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('faculty', 'admin'));

router.get('/dashboard', getFacultyDashboard);
router.get('/subjects', getFacultySubjects);
router.get('/attendance/:subjectId', getSubjectAttendance);
router.post('/attendance/:subjectId', saveSubjectAttendance);

// Notes
router.get('/notes', getFacultyNotes);
router.post('/notes', createFacultyNote);
router.delete('/notes/:id', deleteFacultyNote);

// Marks
router.get('/marks/:subjectId', getSubjectMarks);
router.post('/marks/:subjectId', updateSubjectMarks);

// Assignments
router.get('/assignments', getFacultyAssignments);
router.post('/assignments', createFacultyAssignment);
router.get('/assignments/:assignmentId/submissions', getAssignmentSubmissions);
router.post('/submissions/:submissionId/grade', gradeSubmission);

export default router;
