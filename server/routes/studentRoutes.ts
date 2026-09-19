import { Router } from 'express';
import {
  getStudentDashboard,
  getStudentAttendance,
  getStudentMarks,
  getStudentTimetable,
  getStudentAssignments,
  submitAssignment,
  getStudentNotes
} from '../controllers/studentController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Student-protected routes
router.use(authMiddleware);
router.use(requireRole('student', 'admin'));

router.get('/dashboard', getStudentDashboard);
router.get('/attendance', getStudentAttendance);
router.get('/marks', getStudentMarks);
router.get('/timetable', getStudentTimetable);
router.get('/assignments', getStudentAssignments);
router.post('/assignments/:assignmentId/submit', submitAssignment);
router.get('/notes', getStudentNotes);

export default router;
