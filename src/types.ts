export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  _id: string;
  collegeId: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  departmentId: string;
  departmentName: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  // Student
  rollNumber?: string;
  semester?: number;
  year?: number;
  batch?: string;
  section?: string;
  cgpa?: number;
  // Faculty
  designation?: string;
  specialization?: string;
  assignedSubjects?: string[];
  // Admin
  adminLevel?: string;
}

export interface Department {
  _id: string;
  code: string;
  name: string;
  headOfDepartment: string;
  facultyCount: number;
  studentCount: number;
  description: string;
}

export interface Subject {
  _id: string;
  code: string;
  name: string;
  departmentId: string;
  departmentName: string;
  facultyId: string;
  facultyName: string;
  credits: number;
  semester: number;
  totalClasses: number;
}

export interface AttendanceRecord {
  _id: string;
  studentId: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  facultyId: string;
  semester: number;
}

export interface SubjectAttendanceSummary {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyName?: string;
  totalClasses: number;
  present: number;
  absent: number;
  percentage: number;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  deadline: string;
  maxMarks: number;
  fileAttachment?: string;
  createdAt: string;
  targetDepartment: string;
  targetSemester: number;
  submissionStatus?: 'Pending' | 'Submitted' | 'Late' | 'Graded';
  marksObtained?: number;
  submissionDate?: string;
  submissionCount?: number;
  gradedCount?: number;
  pendingCount?: number;
  submission?: Submission | null;
}

export interface Submission {
  _id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  submissionDate: string;
  fileUrl?: string;
  fileName?: string;
  notes?: string;
  status: 'Pending' | 'Submitted' | 'Late' | 'Graded';
  marksObtained?: number;
  feedback?: string;
  gradedAt?: string;
}

export interface Marks {
  _id: string;
  studentId: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
  gradePoints: number;
  updatedBy: string;
  updatedAt: string;
}

export interface TimetableSlot {
  _id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  room: string;
  departmentId: string;
  semester: number;
  section: string;
}

export interface Notice {
  _id: string;
  title: string;
  description: string;
  department: string;
  date: string;
  priority: 'High' | 'Medium' | 'Low';
  targetRole: 'All' | 'student' | 'faculty' | 'admin';
  attachment?: string;
  postedBy: string;
  author?: string;
  isRead?: boolean;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'assignment' | 'attendance' | 'notice' | 'marks' | 'system';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export type Notification = NotificationItem;

export interface NoteItem {
  _id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  semester: number;
  department: string;
}

export interface ChatMessage {
  _id: string;
  userId: string;
  role: 'user' | 'model';
  message: string;
  timestamp: string;
}
