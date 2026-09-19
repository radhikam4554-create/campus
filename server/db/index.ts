import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  IUser, IDepartment, ICourse, ISubject, IAttendanceRecord,
  IAssignment, ISubmission, IMarks, ITimetableSlot, INotice,
  INotification, INote, IChatMessage
} from '../types/index.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'campus_db.json');

export interface IDatabase {
  users: IUser[];
  departments: IDepartment[];
  courses: ICourse[];
  subjects: ISubject[];
  attendance: IAttendanceRecord[];
  assignments: IAssignment[];
  submissions: ISubmission[];
  marks: IMarks[];
  timetable: ITimetableSlot[];
  notices: INotice[];
  notifications: INotification[];
  notes: INote[];
  chatMessages: IChatMessage[];
}

let dbCache: IDatabase | null = null;

function getInitialSeedData(): IDatabase {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Password@123', salt);

  const departments: IDepartment[] = [
    {
      _id: 'dept_cs',
      code: 'CSE',
      name: 'Computer Science & Engineering',
      headOfDepartment: 'Dr. Rajesh Kulkarni',
      facultyCount: 24,
      studentCount: 480,
      description: 'Department of Computer Science & Engineering, focusing on AI, Cloud, and Software Systems.'
    },
    {
      _id: 'dept_ece',
      code: 'ECE',
      name: 'Electronics & Communication',
      headOfDepartment: 'Dr. Meenakshi Sundaram',
      facultyCount: 18,
      studentCount: 360,
      description: 'Department of Electronics & Communication Engineering covering IoT, VLSI, and Signal Processing.'
    },
    {
      _id: 'dept_me',
      code: 'MECH',
      name: 'Mechanical Engineering',
      headOfDepartment: 'Dr. Anand Deshmukh',
      facultyCount: 16,
      studentCount: 280,
      description: 'Department of Mechanical Engineering, Robotics and Automotive Design.'
    },
    {
      _id: 'dept_it',
      code: 'IT',
      name: 'Information Technology',
      headOfDepartment: 'Dr. Sneha Pillai',
      facultyCount: 15,
      studentCount: 320,
      description: 'Information Technology focusing on Cyber Security, Data Engineering, and Web Technologies.'
    }
  ];

  const users: IUser[] = [
    // Admin
    {
      _id: 'user_admin_1',
      collegeId: 'ADM2020001',
      name: 'Prof. Sunita Rao',
      email: 'admin@campusconnect.edu',
      password: passwordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      departmentId: 'dept_cs',
      departmentName: 'Computer Science & Engineering',
      phone: '+1 (555) 019-2834',
      isActive: true,
      createdAt: '2023-01-15T08:00:00.000Z',
      adminLevel: 'Chief Academic Registrar'
    },
    // Faculty 1 (DBMS & OS)
    {
      _id: 'user_faculty_1',
      collegeId: 'FAC2021004',
      name: 'Dr. Rajesh Kulkarni',
      email: 'faculty@campusconnect.edu',
      password: passwordHash,
      role: 'faculty',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      departmentId: 'dept_cs',
      departmentName: 'Computer Science & Engineering',
      phone: '+1 (555) 018-9273',
      isActive: true,
      createdAt: '2023-03-01T08:00:00.000Z',
      designation: 'Professor & Head of Department',
      specialization: 'Database Systems & High-Performance Computing',
      assignedSubjects: ['subj_dbms', 'subj_os']
    },
    // Faculty 2 (Computer Networks)
    {
      _id: 'user_faculty_2',
      collegeId: 'FAC2021009',
      name: 'Prof. Anita Sharma',
      email: 'anita.sharma@campusconnect.edu',
      password: passwordHash,
      role: 'faculty',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      departmentId: 'dept_cs',
      departmentName: 'Computer Science & Engineering',
      phone: '+1 (555) 014-6622',
      isActive: true,
      createdAt: '2023-04-10T08:00:00.000Z',
      designation: 'Associate Professor',
      specialization: 'Computer Networks & Network Security',
      assignedSubjects: ['subj_cn']
    },
    // Faculty 3 (Software Engineering)
    {
      _id: 'user_faculty_3',
      collegeId: 'FAC2022015',
      name: 'Dr. Vikram Seth',
      email: 'vikram.seth@campusconnect.edu',
      password: passwordHash,
      role: 'faculty',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      departmentId: 'dept_cs',
      departmentName: 'Computer Science & Engineering',
      phone: '+1 (555) 017-8833',
      isActive: true,
      createdAt: '2023-06-15T08:00:00.000Z',
      designation: 'Assistant Professor',
      specialization: 'Software Architecture & Agile Methodologies',
      assignedSubjects: ['subj_se']
    },
    // Student 1 (Aarav Sharma - Main demo student)
    {
      _id: 'user_student_1',
      collegeId: 'CS2024001',
      name: 'Aarav Sharma',
      email: 'student@campusconnect.edu',
      password: passwordHash,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      departmentId: 'dept_cs',
      departmentName: 'Computer Science & Engineering',
      phone: '+1 (555) 012-3456',
      isActive: true,
      createdAt: '2024-08-01T08:00:00.000Z',
      rollNumber: 'CS101',
      semester: 5,
      year: 3,
      batch: '2023-2027',
      section: 'A',
      cgpa: 8.7
    },
    // Student 2 (Priya Singh)
    {
      _id: 'user_student_2',
      collegeId: 'CS2024002',
      name: 'Priya Singh',
      email: 'priya.singh@campusconnect.edu',
      password: passwordHash,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      departmentId: 'dept_cs',
      departmentName: 'Computer Science & Engineering',
      phone: '+1 (555) 012-7890',
      isActive: true,
      createdAt: '2024-08-01T08:00:00.000Z',
      rollNumber: 'CS102',
      semester: 5,
      year: 3,
      batch: '2023-2027',
      section: 'A',
      cgpa: 9.1
    },
    // Student 3 (Aman Verma)
    {
      _id: 'user_student_3',
      collegeId: 'CS2024003',
      name: 'Aman Verma',
      email: 'aman.verma@campusconnect.edu',
      password: passwordHash,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      departmentId: 'dept_cs',
      departmentName: 'Computer Science & Engineering',
      phone: '+1 (555) 012-4411',
      isActive: true,
      createdAt: '2024-08-01T08:00:00.000Z',
      rollNumber: 'CS103',
      semester: 5,
      year: 3,
      batch: '2023-2027',
      section: 'A',
      cgpa: 8.2
    },
    // Student 4 (Rohan Iyer)
    {
      _id: 'user_student_4',
      collegeId: 'CS2024004',
      name: 'Rohan Iyer',
      email: 'rohan.iyer@campusconnect.edu',
      password: passwordHash,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      departmentId: 'dept_cs',
      departmentName: 'Computer Science & Engineering',
      phone: '+1 (555) 012-9901',
      isActive: true,
      createdAt: '2024-08-01T08:00:00.000Z',
      rollNumber: 'CS104',
      semester: 5,
      year: 3,
      batch: '2023-2027',
      section: 'A',
      cgpa: 8.5
    },
    // Student 5 (Sneha Kapoor)
    {
      _id: 'user_student_5',
      collegeId: 'CS2024005',
      name: 'Sneha Kapoor',
      email: 'sneha.kapoor@campusconnect.edu',
      password: passwordHash,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      departmentId: 'dept_cs',
      departmentName: 'Computer Science & Engineering',
      phone: '+1 (555) 012-6677',
      isActive: true,
      createdAt: '2024-08-01T08:00:00.000Z',
      rollNumber: 'CS105',
      semester: 5,
      year: 3,
      batch: '2023-2027',
      section: 'A',
      cgpa: 8.9
    }
  ];

  const courses: ICourse[] = [
    { _id: 'course_btech_cse', code: 'BTECH-CSE', name: 'Bachelor of Technology in CSE', departmentId: 'dept_cs', credits: 160, semester: 5, type: 'Theory' },
    { _id: 'course_mtech_cse', code: 'MTECH-CSE', name: 'Master of Technology in CSE', departmentId: 'dept_cs', credits: 80, semester: 1, type: 'Theory' },
    { _id: 'course_btech_ece', code: 'BTECH-ECE', name: 'Bachelor of Technology in ECE', departmentId: 'dept_ece', credits: 160, semester: 5, type: 'Theory' },
  ];

  const subjects: ISubject[] = [
    {
      _id: 'subj_dbms',
      code: 'CS501',
      name: 'Database Management Systems',
      departmentId: 'dept_cs',
      departmentName: 'Computer Science & Engineering',
      facultyId: 'user_faculty_1',
      facultyName: 'Dr. Rajesh Kulkarni',
      credits: 4,
      semester: 5,
      totalClasses: 40
    },
    {
      _id: 'subj_os',
      code: 'CS502',
      name: 'Operating Systems',
      departmentId: 'dept_cs',
      departmentName: 'Computer Science & Engineering',
      facultyId: 'user_faculty_1',
      facultyName: 'Dr. Rajesh Kulkarni',
      credits: 4,
      semester: 5,
      totalClasses: 38
    },
    {
      _id: 'subj_cn',
      code: 'CS503',
      name: 'Computer Networks',
      departmentId: 'dept_cs',
      departmentName: 'Computer Science & Engineering',
      facultyId: 'user_faculty_2',
      facultyName: 'Prof. Anita Sharma',
      credits: 4,
      semester: 5,
      totalClasses: 42
    },
    {
      _id: 'subj_se',
      code: 'CS504',
      name: 'Software Engineering',
      departmentId: 'dept_cs',
      departmentName: 'Computer Science & Engineering',
      facultyId: 'user_faculty_3',
      facultyName: 'Dr. Vikram Seth',
      credits: 3,
      semester: 5,
      totalClasses: 36
    }
  ];

  // Realistic attendance records for students
  const attendance: IAttendanceRecord[] = [];
  const subjectsMeta = [
    { id: 'subj_dbms', code: 'CS501', name: 'Database Management Systems', faculty: 'user_faculty_1', total: 40, presentStudent1: 37 },
    { id: 'subj_os', code: 'CS502', name: 'Operating Systems', faculty: 'user_faculty_1', total: 38, presentStudent1: 34 },
    { id: 'subj_cn', code: 'CS503', name: 'Computer Networks', faculty: 'user_faculty_2', total: 42, presentStudent1: 35 },
    { id: 'subj_se', code: 'CS504', name: 'Software Engineering', faculty: 'user_faculty_3', total: 36, presentStudent1: 32 }
  ];

  // Generate 15 recent session dates
  const dates = [
    '2025-09-01', '2025-09-02', '2025-09-03', '2025-09-04', '2025-09-05',
    '2025-09-08', '2025-09-09', '2025-09-10', '2025-09-11', '2025-09-12',
    '2025-09-15', '2025-09-16', '2025-09-17', '2025-09-18', '2025-09-19'
  ];

  let attCounter = 1;
  for (const sMeta of subjectsMeta) {
    dates.forEach((d, idx) => {
      // For student 1
      const isAbsent1 = (sMeta.id === 'subj_cn' && (idx === 3 || idx === 8)) || (sMeta.id === 'subj_os' && idx === 5);
      attendance.push({
        _id: `att_${attCounter++}`,
        studentId: 'user_student_1',
        subjectId: sMeta.id,
        subjectCode: sMeta.code,
        subjectName: sMeta.name,
        date: d,
        status: isAbsent1 ? 'Absent' : 'Present',
        facultyId: sMeta.faculty,
        semester: 5
      });

      // For student 2 (Priya)
      attendance.push({
        _id: `att_${attCounter++}`,
        studentId: 'user_student_2',
        subjectId: sMeta.id,
        subjectCode: sMeta.code,
        subjectName: sMeta.name,
        date: d,
        status: 'Present',
        facultyId: sMeta.faculty,
        semester: 5
      });

      // For student 3 (Aman)
      const isAbsent3 = idx % 4 === 0;
      attendance.push({
        _id: `att_${attCounter++}`,
        studentId: 'user_student_3',
        subjectId: sMeta.id,
        subjectCode: sMeta.code,
        subjectName: sMeta.name,
        date: d,
        status: isAbsent3 ? 'Absent' : 'Present',
        facultyId: sMeta.faculty,
        semester: 5
      });
    });
  }

  const assignments: IAssignment[] = [
    {
      _id: 'asg_1',
      title: 'B+ Tree Indexing & Query Optimization in PostgreSQL',
      description: 'Implement an indexed query benchmark comparing B+ tree, Hash, and GIN indexes on a dataset of 1M records. Include execution plan analysis with EXPLAIN ANALYZE.',
      subjectId: 'subj_dbms',
      subjectName: 'Database Management Systems',
      facultyId: 'user_faculty_1',
      facultyName: 'Dr. Rajesh Kulkarni',
      deadline: '2025-09-24T23:59:59.000Z',
      maxMarks: 50,
      createdAt: '2025-09-10T10:00:00.000Z',
      targetDepartment: 'dept_cs',
      targetSemester: 5
    },
    {
      _id: 'asg_2',
      title: 'Multi-threaded CPU Scheduling Simulation (CFS)',
      description: 'Design and implement the Linux Completely Fair Scheduler (CFS) in C/C++ or Rust using red-black trees to track virtual runtime across competing threads.',
      subjectId: 'subj_os',
      subjectName: 'Operating Systems',
      facultyId: 'user_faculty_1',
      facultyName: 'Dr. Rajesh Kulkarni',
      deadline: '2025-09-28T23:59:59.000Z',
      maxMarks: 50,
      createdAt: '2025-09-12T14:30:00.000Z',
      targetDepartment: 'dept_cs',
      targetSemester: 5
    },
    {
      _id: 'asg_3',
      title: 'TCP Congestion Control & Packet Analysis via Wireshark',
      description: 'Analyze TCP Reno vs Cubic congestion window dynamics under varying latency and packet drop rates using Wireshark trace files and ns-3 simulation scripts.',
      subjectId: 'subj_cn',
      subjectName: 'Computer Networks',
      facultyId: 'user_faculty_2',
      facultyName: 'Prof. Anita Sharma',
      deadline: '2025-09-30T23:59:59.000Z',
      maxMarks: 40,
      createdAt: '2025-09-14T09:00:00.000Z',
      targetDepartment: 'dept_cs',
      targetSemester: 5
    },
    {
      _id: 'asg_4',
      title: 'Microservices Architecture Design & UML Specifications',
      description: 'Draft comprehensive Domain-Driven Design (DDD) bounded contexts, sequence diagrams, and OpenAPI 3.0 specifications for an enterprise campus system.',
      subjectId: 'subj_se',
      subjectName: 'Software Engineering',
      facultyId: 'user_faculty_3',
      facultyName: 'Dr. Vikram Seth',
      deadline: '2025-09-18T23:59:59.000Z',
      maxMarks: 30,
      createdAt: '2025-09-01T09:00:00.000Z',
      targetDepartment: 'dept_cs',
      targetSemester: 5
    }
  ];

  const submissions: ISubmission[] = [
    {
      _id: 'sub_1',
      assignmentId: 'asg_4',
      studentId: 'user_student_1',
      studentName: 'Aarav Sharma',
      studentRoll: 'CS101',
      submissionDate: '2025-09-17T18:45:00.000Z',
      fileName: 'Aarav_Sharma_CS101_Microservices_DDD.pdf',
      fileUrl: 'https://example.com/uploads/asg4_aarav.pdf',
      notes: 'Completed all bounded contexts and architectural trade-off diagrams.',
      status: 'Graded',
      marksObtained: 28,
      feedback: 'Excellent architectural clarity, particularly on asynchronous event messaging.',
      gradedAt: '2025-09-18T11:20:00.000Z'
    },
    {
      _id: 'sub_2',
      assignmentId: 'asg_1',
      studentId: 'user_student_2',
      studentName: 'Priya Singh',
      studentRoll: 'CS102',
      submissionDate: '2025-09-20T12:00:00.000Z',
      fileName: 'Priya_Singh_CS102_BTree_Index.pdf',
      fileUrl: 'https://example.com/uploads/asg1_priya.pdf',
      notes: 'Submitted ahead of deadline.',
      status: 'Submitted'
    }
  ];

  const marks: IMarks[] = [
    {
      _id: 'marks_1',
      studentId: 'user_student_1',
      subjectId: 'subj_dbms',
      subjectCode: 'CS501',
      subjectName: 'Database Management Systems',
      semester: 5,
      internalMarks: 24,
      externalMarks: 62,
      totalMarks: 86,
      grade: 'A',
      gradePoints: 9.0,
      updatedBy: 'Dr. Rajesh Kulkarni',
      updatedAt: '2025-09-15T10:00:00.000Z'
    },
    {
      _id: 'marks_2',
      studentId: 'user_student_1',
      subjectId: 'subj_os',
      subjectCode: 'CS502',
      subjectName: 'Operating Systems',
      semester: 5,
      internalMarks: 22,
      externalMarks: 58,
      totalMarks: 80,
      grade: 'A',
      gradePoints: 8.5,
      updatedBy: 'Dr. Rajesh Kulkarni',
      updatedAt: '2025-09-15T10:00:00.000Z'
    },
    {
      _id: 'marks_3',
      studentId: 'user_student_1',
      subjectId: 'subj_cn',
      subjectCode: 'CS503',
      subjectName: 'Computer Networks',
      semester: 5,
      internalMarks: 20,
      externalMarks: 55,
      totalMarks: 75,
      grade: 'B+',
      gradePoints: 8.0,
      updatedBy: 'Prof. Anita Sharma',
      updatedAt: '2025-09-15T10:00:00.000Z'
    },
    {
      _id: 'marks_4',
      studentId: 'user_student_1',
      subjectId: 'subj_se',
      subjectCode: 'CS504',
      subjectName: 'Software Engineering',
      semester: 5,
      internalMarks: 27,
      externalMarks: 64,
      totalMarks: 91,
      grade: 'A+',
      gradePoints: 10.0,
      updatedBy: 'Dr. Vikram Seth',
      updatedAt: '2025-09-15T10:00:00.000Z'
    }
  ];

  const timetable: ITimetableSlot[] = [
    // Monday
    { _id: 'tt_1', day: 'Monday', startTime: '09:00', endTime: '10:00', subjectId: 'subj_dbms', subjectCode: 'CS501', subjectName: 'Database Management Systems', facultyId: 'user_faculty_1', facultyName: 'Dr. Rajesh Kulkarni', room: 'LH-301', departmentId: 'dept_cs', semester: 5, section: 'A' },
    { _id: 'tt_2', day: 'Monday', startTime: '10:00', endTime: '11:00', subjectId: 'subj_os', subjectCode: 'CS502', subjectName: 'Operating Systems', facultyId: 'user_faculty_1', facultyName: 'Dr. Rajesh Kulkarni', room: 'LH-301', departmentId: 'dept_cs', semester: 5, section: 'A' },
    { _id: 'tt_3', day: 'Monday', startTime: '11:30', endTime: '12:30', subjectId: 'subj_cn', subjectCode: 'CS503', subjectName: 'Computer Networks', facultyId: 'user_faculty_2', facultyName: 'Prof. Anita Sharma', room: 'LH-302', departmentId: 'dept_cs', semester: 5, section: 'A' },
    { _id: 'tt_4', day: 'Monday', startTime: '14:00', endTime: '16:00', subjectId: 'subj_dbms', subjectCode: 'CS501', subjectName: 'DBMS Lab (Batch A)', facultyId: 'user_faculty_1', facultyName: 'Dr. Rajesh Kulkarni', room: 'Lab-2', departmentId: 'dept_cs', semester: 5, section: 'A' },

    // Tuesday
    { _id: 'tt_5', day: 'Tuesday', startTime: '09:00', endTime: '10:00', subjectId: 'subj_cn', subjectCode: 'CS503', subjectName: 'Computer Networks', facultyId: 'user_faculty_2', facultyName: 'Prof. Anita Sharma', room: 'LH-302', departmentId: 'dept_cs', semester: 5, section: 'A' },
    { _id: 'tt_6', day: 'Tuesday', startTime: '10:00', endTime: '11:00', subjectId: 'subj_se', subjectCode: 'CS504', subjectName: 'Software Engineering', facultyId: 'user_faculty_3', facultyName: 'Dr. Vikram Seth', room: 'LH-301', departmentId: 'dept_cs', semester: 5, section: 'A' },
    { _id: 'tt_7', day: 'Tuesday', startTime: '11:30', endTime: '12:30', subjectId: 'subj_dbms', subjectCode: 'CS501', subjectName: 'Database Management Systems', facultyId: 'user_faculty_1', facultyName: 'Dr. Rajesh Kulkarni', room: 'LH-301', departmentId: 'dept_cs', semester: 5, section: 'A' },

    // Wednesday
    { _id: 'tt_8', day: 'Wednesday', startTime: '09:00', endTime: '10:00', subjectId: 'subj_os', subjectCode: 'CS502', subjectName: 'Operating Systems', facultyId: 'user_faculty_1', facultyName: 'Dr. Rajesh Kulkarni', room: 'LH-301', departmentId: 'dept_cs', semester: 5, section: 'A' },
    { _id: 'tt_9', day: 'Wednesday', startTime: '10:00', endTime: '11:00', subjectId: 'subj_se', subjectCode: 'CS504', subjectName: 'Software Engineering', facultyId: 'user_faculty_3', facultyName: 'Dr. Vikram Seth', room: 'LH-301', departmentId: 'dept_cs', semester: 5, section: 'A' },
    { _id: 'tt_10', day: 'Wednesday', startTime: '14:00', endTime: '16:00', subjectId: 'subj_cn', subjectCode: 'CS503', subjectName: 'Networks Lab (Batch A)', facultyId: 'user_faculty_2', facultyName: 'Prof. Anita Sharma', room: 'Lab-4', departmentId: 'dept_cs', semester: 5, section: 'A' },

    // Thursday
    { _id: 'tt_11', day: 'Thursday', startTime: '09:00', endTime: '10:00', subjectId: 'subj_dbms', subjectCode: 'CS501', subjectName: 'Database Management Systems', facultyId: 'user_faculty_1', facultyName: 'Dr. Rajesh Kulkarni', room: 'LH-301', departmentId: 'dept_cs', semester: 5, section: 'A' },
    { _id: 'tt_12', day: 'Thursday', startTime: '10:00', endTime: '11:00', subjectId: 'subj_os', subjectCode: 'CS502', subjectName: 'Operating Systems', facultyId: 'user_faculty_1', facultyName: 'Dr. Rajesh Kulkarni', room: 'LH-301', departmentId: 'dept_cs', semester: 5, section: 'A' },
    { _id: 'tt_13', day: 'Thursday', startTime: '11:30', endTime: '12:30', subjectId: 'subj_cn', subjectCode: 'CS503', subjectName: 'Computer Networks', facultyId: 'user_faculty_2', facultyName: 'Prof. Anita Sharma', room: 'LH-302', departmentId: 'dept_cs', semester: 5, section: 'A' },

    // Friday
    { _id: 'tt_14', day: 'Friday', startTime: '09:00', endTime: '10:00', subjectId: 'subj_se', subjectCode: 'CS504', subjectName: 'Software Engineering', facultyId: 'user_faculty_3', facultyName: 'Dr. Vikram Seth', room: 'LH-301', departmentId: 'dept_cs', semester: 5, section: 'A' },
    { _id: 'tt_15', day: 'Friday', startTime: '10:00', endTime: '11:00', subjectId: 'subj_dbms', subjectCode: 'CS501', subjectName: 'Database Management Systems', facultyId: 'user_faculty_1', facultyName: 'Dr. Rajesh Kulkarni', room: 'LH-301', departmentId: 'dept_cs', semester: 5, section: 'A' },
    { _id: 'tt_16', day: 'Friday', startTime: '14:00', endTime: '16:00', subjectId: 'subj_os', subjectCode: 'CS502', subjectName: 'OS Kernel Lab (Batch A)', facultyId: 'user_faculty_1', facultyName: 'Dr. Rajesh Kulkarni', room: 'Lab-1', departmentId: 'dept_cs', semester: 5, section: 'A' },

    // Saturday
    { _id: 'tt_17', day: 'Saturday', startTime: '10:00', endTime: '12:00', subjectId: 'subj_se', subjectCode: 'CS504', subjectName: 'Project Seminar & Industry Mentorship', facultyId: 'user_faculty_3', facultyName: 'Dr. Vikram Seth', room: 'Auditorium-B', departmentId: 'dept_cs', semester: 5, section: 'A' },
  ];

  const notices: INotice[] = [
    {
      _id: 'notice_1',
      title: 'Mid-Semester Examinations Schedule (Autumn 2025)',
      description: 'The mid-semester examinations for 3rd and 4th year undergraduate programs commence on October 14th, 2025. Students must ensure minimum 75% aggregate attendance to be eligible for admit cards.',
      department: 'All',
      date: '2025-09-16',
      priority: 'High',
      targetRole: 'All',
      attachment: 'Mid_Sem_Exam_Schedule_Autumn2025.pdf',
      postedBy: 'Prof. Sunita Rao (Registrar)',
      readBy: ['user_student_1']
    },
    {
      _id: 'notice_2',
      title: 'Google & Microsoft Annual Campus Recruitment Drive 2025-26',
      description: 'Pre-placement talks and technical round 1 for final and pre-final year students (B.Tech CSE/IT/ECE) with CGPA >= 8.0 will take place in the Main Auditorium on September 27th.',
      department: 'Computer Science & Engineering',
      date: '2025-09-15',
      priority: 'High',
      targetRole: 'student',
      attachment: 'Placement_Guidelines_Tier1.pdf',
      postedBy: 'Training & Placement Cell',
      readBy: []
    },
    {
      _id: 'notice_3',
      title: 'Smart India Hackathon & AI Innovation Grant Submissions Open',
      description: 'Teams of up to 6 students can submit project proposals for the Institutional AI Grant of up to $5,000. Faculty mentors are requested to review team abstracts by September 30th.',
      department: 'All',
      date: '2025-09-12',
      priority: 'Medium',
      targetRole: 'All',
      postedBy: 'Dr. Rajesh Kulkarni (Research Dean)',
      readBy: ['user_student_1']
    },
    {
      _id: 'notice_4',
      title: 'Faculty Academic Council Meeting — Curriculum Revamp',
      description: 'All department heads and senior professors are invited to the Academic Senate meeting on Friday at 4:00 PM in Conference Room A.',
      department: 'All',
      date: '2025-09-10',
      priority: 'Low',
      targetRole: 'faculty',
      postedBy: 'Office of the Dean Academic',
      readBy: ['user_faculty_1']
    }
  ];

  const notifications: INotification[] = [
    {
      _id: 'notif_1',
      userId: 'user_student_1',
      title: 'New assignment posted',
      message: 'Dr. Rajesh Kulkarni posted "B+ Tree Indexing & Query Optimization" in DBMS.',
      type: 'assignment',
      isRead: false,
      createdAt: '2025-09-18T09:30:00.000Z',
      link: '/assignments'
    },
    {
      _id: 'notif_2',
      userId: 'user_student_1',
      title: 'Marks have been updated',
      message: 'Your marks for Software Engineering assignment #4 were graded: 28/30.',
      type: 'marks',
      isRead: false,
      createdAt: '2025-09-18T11:20:00.000Z',
      link: '/marks'
    },
    {
      _id: 'notif_3',
      userId: 'user_student_1',
      title: 'Attendance updated',
      message: 'Attendance for Computer Networks on Sep 17 was marked: Present.',
      type: 'attendance',
      isRead: true,
      createdAt: '2025-09-17T12:40:00.000Z',
      link: '/attendance'
    },
    {
      _id: 'notif_4',
      userId: 'user_student_1',
      title: 'New notice published',
      message: 'Mid-Semester Examinations Schedule (Autumn 2025) has been announced.',
      type: 'notice',
      isRead: true,
      createdAt: '2025-09-16T14:00:00.000Z',
      link: '/notices'
    },
    {
      _id: 'notif_5',
      userId: 'user_faculty_1',
      title: 'Assignment Submissions Received',
      message: 'Priya Singh submitted "B+ Tree Indexing & Query Optimization".',
      type: 'assignment',
      isRead: false,
      createdAt: '2025-09-20T12:00:00.000Z',
      link: '/assignments'
    }
  ];

  const notes: INote[] = [
    {
      _id: 'note_1',
      title: 'Unit 3: Transaction Processing, ACID properties & Strict 2PL',
      subjectId: 'subj_dbms',
      subjectName: 'Database Management Systems',
      facultyId: 'user_faculty_1',
      facultyName: 'Dr. Rajesh Kulkarni',
      description: 'Comprehensive lecture slides covering Serializability, Conflict Serializability graphs, and Deadlock Prevention mechanisms.',
      fileName: 'DBMS_Unit3_Transactions_2PL.pdf',
      fileUrl: 'https://example.com/notes/dbms_unit3.pdf',
      createdAt: '2025-09-10T14:00:00.000Z',
      semester: 5,
      department: 'dept_cs'
    },
    {
      _id: 'note_2',
      title: 'Unit 2: Virtual Memory Management & Page Replacement Algorithms',
      subjectId: 'subj_os',
      subjectName: 'Operating Systems',
      facultyId: 'user_faculty_1',
      facultyName: 'Dr. Rajesh Kulkarni',
      description: 'Detailed analysis of FIFO, LRU, Optimal page replacement, Belady anomaly, and Translation Lookaside Buffer (TLB).',
      fileName: 'OS_Unit2_Virtual_Memory.pdf',
      fileUrl: 'https://example.com/notes/os_unit2.pdf',
      createdAt: '2025-09-12T11:00:00.000Z',
      semester: 5,
      department: 'dept_cs'
    },
    {
      _id: 'note_3',
      title: 'Unit 4: Transport Layer & TCP Congestion Control Algorithms',
      subjectId: 'subj_cn',
      subjectName: 'Computer Networks',
      facultyId: 'user_faculty_2',
      facultyName: 'Prof. Anita Sharma',
      description: 'Mathematical derivation of AIMD, Slow Start, Fast Retransmit, and BBR congestion control principles.',
      fileName: 'CN_Unit4_TCP_Congestion.pdf',
      fileUrl: 'https://example.com/notes/cn_unit4.pdf',
      createdAt: '2025-09-14T16:30:00.000Z',
      semester: 5,
      department: 'dept_cs'
    }
  ];

  return {
    users,
    departments,
    courses,
    subjects,
    attendance,
    assignments,
    submissions,
    marks,
    timetable,
    notices,
    notifications,
    notes,
    chatMessages: []
  };
}

export function getDb(): IDatabase {
  if (dbCache) {
    return dbCache;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      dbCache = JSON.parse(content);
      return dbCache!;
    }
  } catch (err) {
    console.warn('Could not read existing data file, initializing fresh database', err);
  }

  const initial = getInitialSeedData();
  dbCache = initial;
  saveDb(initial);
  return dbCache;
}

export function saveDb(data: IDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    dbCache = data;
  } catch (err) {
    console.error('Failed to save database to disk:', err);
  }
}
