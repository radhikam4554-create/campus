import { Router } from 'express';
import {
  getAdminDashboard,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getSubjects,
  createSubject,
  updateSubject,
  getAdminTimetable,
  createTimetableSlot,
  deleteTimetableSlot,
  createNotice,
  deleteNotice,
  getStudentMarksAdmin
} from '../controllers/adminController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/dashboard', getAdminDashboard);

// Students
router.get('/students', getAllStudents);
router.get('/students/:id/marks', getStudentMarksAdmin);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// Faculty
router.get('/faculty', getAllFaculty);
router.post('/faculty', createFaculty);
router.put('/faculty/:id', updateFaculty);
router.delete('/faculty/:id', deleteFaculty);

// Departments
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

// Subjects
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);

// Timetable
router.get('/timetable', getAdminTimetable);
router.post('/timetable', createTimetableSlot);
router.delete('/timetable/:id', deleteTimetableSlot);

// Notices
router.post('/notices', createNotice);
router.delete('/notices/:id', deleteNotice);

export default router;
