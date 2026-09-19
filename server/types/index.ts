export interface IUser {
  _id: string;
  collegeId: string;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'faculty' | 'admin';
  avatar?: string;
  departmentId: string;
  departmentName: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  // Student specific
  rollNumber?: string;
  semester?: number;
  year?: number;
  batch?: string;
  section?: string;
  cgpa?: number;
  // Faculty specific
  designation?: string;
  specialization?: string;
  assignedSubjects?: string[]; // subject IDs
  // Admin specific
  adminLevel?: string;
}

export interface IDepartment {
  _id: string;
  code: string;
  name: string;
  headOfDepartment: string;
  facultyCount: number;
  studentCount: number;
  description: string;
}

export interface ICourse {
  _id: string;
  code: string;
  name: string;
  departmentId: string;
  credits: number;
  semester: number;
  type: 'Theory' | 'Practical' | 'Elective';
}

export interface ISubject {
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

export interface IAttendanceRecord {
  _id: string;
  studentId: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late';
  facultyId: string;
  semester: number;
}

export interface IAssignment {
  _id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  deadline: string; // ISO date string
  maxMarks: number;
  fileAttachment?: string;
  createdAt: string;
  targetDepartment: string;
  targetSemester: number;
}

export interface ISubmission {
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

export interface IMarks {
  _id: string;
  studentId: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  internalMarks: number; // Max 30
  externalMarks: number; // Max 70
  totalMarks: number; // Max 100
  grade: string;
  gradePoints: number;
  updatedBy: string;
  updatedAt: string;
}

export interface ITimetableSlot {
  _id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g., '09:00'
  endTime: string; // e.g., '10:00'
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

export interface INotice {
  _id: string;
  title: string;
  description: string;
  department: string; // 'All' | Department Name
  date: string;
  priority: 'High' | 'Medium' | 'Low';
  targetRole: 'All' | 'student' | 'faculty' | 'admin';
  attachment?: string;
  postedBy: string;
  readBy: string[]; // user IDs who have read it
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'assignment' | 'attendance' | 'notice' | 'marks' | 'system';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface IChatMessage {
  _id: string;
  userId: string;
  role: 'user' | 'model';
  message: string;
  timestamp: string;
}

export interface INote {
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
