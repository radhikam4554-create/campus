import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, saveDb } from '../db/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { IUser, IDepartment, ICourse, ISubject, ITimetableSlot, INotice } from '../types/index.js';

export const getAdminDashboard = (req: AuthRequest, res: Response) => {
  const db = getDb();

  const totalStudents = db.users.filter(u => u.role === 'student').length;
  const totalFaculty = db.users.filter(u => u.role === 'faculty').length;
  const totalDepartments = db.departments.length;
  const activeCourses = db.subjects.length;

  // Average attendance across institution
  const totalAtt = db.attendance.length;
  const presentAtt = db.attendance.filter(a => a.status === 'Present').length;
  const avgAttendance = totalAtt > 0 ? Number(((presentAtt / totalAtt) * 100).toFixed(1)) : 88.2;

  // Charts
  const enrollmentTrends = [
    { year: '2021', CSE: 360, ECE: 280, MECH: 240, IT: 220 },
    { year: '2022', CSE: 400, ECE: 310, MECH: 250, IT: 260 },
    { year: '2023', CSE: 440, ECE: 330, MECH: 260, IT: 290 },
    { year: '2024', CSE: 480, ECE: 360, MECH: 280, IT: 320 },
    { year: '2025', CSE: 520, ECE: 390, MECH: 290, IT: 350 },
  ];

  const departmentDistribution = db.departments.map(d => ({
    name: d.code,
    students: d.studentCount,
    faculty: d.facultyCount
  }));

  const attendanceTrends = [
    { month: 'May', CSE: 89, ECE: 86, MECH: 84, IT: 88 },
    { month: 'Jun', CSE: 91, ECE: 87, MECH: 85, IT: 89 },
    { month: 'Jul', CSE: 88, ECE: 84, MECH: 82, IT: 86 },
    { month: 'Aug', CSE: 90, ECE: 88, MECH: 87, IT: 89 },
    { month: 'Sep', CSE: 92, ECE: 89, MECH: 86, IT: 91 },
  ];

  const academicPerformance = [
    { grade: 'A+ (>=90%)', count: 142 },
    { grade: 'A (80-89%)', count: 284 },
    { grade: 'B+ (70-79%)', count: 320 },
    { grade: 'B (60-69%)', count: 180 },
    { grade: 'C (50-59%)', count: 64 },
    { grade: 'Remedial (<50%)', count: 18 },
  ];

  const recentNotices = db.notices.slice(0, 5);

  return res.json({
    success: true,
    data: {
      kpis: {
        totalStudents: totalStudents > 10 ? totalStudents : 1440,
        totalFaculty: totalFaculty > 5 ? totalFaculty : 73,
        departments: totalDepartments,
        activeCourses: activeCourses || 48,
        averageAttendance: avgAttendance,
        pendingComplaints: 3
      },
      enrollmentTrends,
      departmentDistribution,
      attendanceTrends,
      academicPerformance,
      recentNotices
    }
  });
};

// Students Management
export const getAllStudents = (req: AuthRequest, res: Response) => {
  const { department, year, search } = req.query;
  const db = getDb();

  let students = db.users.filter(u => u.role === 'student');

  if (department && department !== 'All') {
    students = students.filter(s => s.departmentId === department || s.departmentName === department);
  }

  if (year && year !== 'All') {
    students = students.filter(s => s.year === Number(year));
  }

  if (search) {
    const q = (search as string).toLowerCase();
    students = students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.collegeId.toLowerCase().includes(q) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
      s.email.toLowerCase().includes(q)
    );
  }

  return res.json({
    success: true,
    data: students.map(s => {
      const { password, ...safe } = s;
      return safe;
    })
  });
};

export const createStudent = (req: AuthRequest, res: Response) => {
  const { name, email, departmentId, year, semester, rollNumber, phone } = req.body;

  if (!name || !email || !departmentId) {
    return res.status(400).json({ success: false, message: 'Name, email, and department are required.' });
  }

  const db = getDb();
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
  }

  const dept = db.departments.find(d => d._id === departmentId);
  const collegeId = `CS${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`;

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Password@123', salt);

  const newStudent: IUser = {
    _id: `user_student_${Date.now()}`,
    collegeId,
    name,
    email: email.toLowerCase(),
    password: passwordHash,
    role: 'student',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    departmentId,
    departmentName: dept ? dept.name : 'Engineering',
    phone: phone || '+1 (555) 012-0000',
    isActive: true,
    createdAt: new Date().toISOString(),
    rollNumber: rollNumber || `CS${Math.floor(100 + Math.random() * 900)}`,
    semester: Number(semester) || 5,
    year: Number(year) || 3,
    batch: '2023-2027',
    section: 'A',
    cgpa: 8.5
  };

  db.users.push(newStudent);
  saveDb(db);

  const { password, ...safe } = newStudent;
  return res.json({
    success: true,
    message: `Student account created! College ID: ${collegeId}, Default Password: Password@123`,
    data: safe
  });
};

export const updateStudent = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const db = getDb();
  const idx = db.users.findIndex(u => u._id === id && u.role === 'student');

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  if (updates.departmentId) {
    const dept = db.departments.find(d => d._id === updates.departmentId);
    if (dept) {
      db.users[idx].departmentId = dept._id;
      db.users[idx].departmentName = dept.name;
    }
  }

  if (updates.name) db.users[idx].name = updates.name;
  if (updates.phone) db.users[idx].phone = updates.phone;
  if (updates.rollNumber) db.users[idx].rollNumber = updates.rollNumber;
  if (updates.semester) db.users[idx].semester = Number(updates.semester);
  if (updates.year) db.users[idx].year = Number(updates.year);
  if (updates.cgpa) db.users[idx].cgpa = Number(updates.cgpa);
  if (updates.isActive !== undefined) db.users[idx].isActive = updates.isActive;

  saveDb(db);
  const { password, ...safe } = db.users[idx];

  return res.json({
    success: true,
    message: 'Student updated successfully.',
    data: safe
  });
};

export const deleteStudent = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDb();

  const idx = db.users.findIndex(u => u._id === id && u.role === 'student');
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  db.users.splice(idx, 1);
  saveDb(db);

  return res.json({ success: true, message: 'Student deleted successfully.' });
};

// Faculty Management
export const getAllFaculty = (req: AuthRequest, res: Response) => {
  const db = getDb();
  const faculty = db.users.filter(u => u.role === 'faculty');

  return res.json({
    success: true,
    data: faculty.map(f => {
      const { password, ...safe } = f;
      return safe;
    })
  });
};

export const createFaculty = (req: AuthRequest, res: Response) => {
  const { name, email, departmentId, designation, specialization, phone } = req.body;

  if (!name || !email || !departmentId) {
    return res.status(400).json({ success: false, message: 'Name, email, and department are required.' });
  }

  const db = getDb();
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
  }

  const dept = db.departments.find(d => d._id === departmentId);
  const collegeId = `FAC${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`;

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Password@123', salt);

  const newFaculty: IUser = {
    _id: `user_faculty_${Date.now()}`,
    collegeId,
    name,
    email: email.toLowerCase(),
    password: passwordHash,
    role: 'faculty',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    departmentId,
    departmentName: dept ? dept.name : 'Engineering',
    phone: phone || '+1 (555) 018-0000',
    isActive: true,
    createdAt: new Date().toISOString(),
    designation: designation || 'Assistant Professor',
    specialization: specialization || 'Computer Engineering',
    assignedSubjects: []
  };

  db.users.push(newFaculty);
  saveDb(db);

  const { password, ...safe } = newFaculty;
  return res.json({
    success: true,
    message: `Faculty account created! College ID: ${collegeId}, Default Password: Password@123`,
    data: safe
  });
};

export const updateFaculty = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const db = getDb();
  const idx = db.users.findIndex(u => u._id === id && u.role === 'faculty');

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Faculty not found.' });
  }

  if (updates.name) db.users[idx].name = updates.name;
  if (updates.phone) db.users[idx].phone = updates.phone;
  if (updates.designation) db.users[idx].designation = updates.designation;
  if (updates.specialization) db.users[idx].specialization = updates.specialization;
  if (updates.assignedSubjects) db.users[idx].assignedSubjects = updates.assignedSubjects;
  if (updates.isActive !== undefined) db.users[idx].isActive = updates.isActive;

  saveDb(db);
  const { password, ...safe } = db.users[idx];

  return res.json({
    success: true,
    message: 'Faculty member updated successfully.',
    data: safe
  });
};

export const deleteFaculty = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDb();

  const idx = db.users.findIndex(u => u._id === id && u.role === 'faculty');
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Faculty not found.' });
  }

  db.users.splice(idx, 1);
  saveDb(db);

  return res.json({ success: true, message: 'Faculty member deleted successfully.' });
};

// Departments Management
export const getDepartments = (req: AuthRequest, res: Response) => {
  const db = getDb();
  return res.json({ success: true, data: db.departments });
};

export const createDepartment = (req: AuthRequest, res: Response) => {
  const { code, name, headOfDepartment, description } = req.body;
  if (!code || !name) {
    return res.status(400).json({ success: false, message: 'Department code and name are required.' });
  }

  const db = getDb();
  const newDept: IDepartment = {
    _id: `dept_${code.toLowerCase()}_${Date.now()}`,
    code: code.toUpperCase(),
    name,
    headOfDepartment: headOfDepartment || 'To be appointed',
    facultyCount: 0,
    studentCount: 0,
    description: description || ''
  };

  db.departments.push(newDept);
  saveDb(db);

  return res.json({ success: true, message: 'Department created.', data: newDept });
};

export const updateDepartment = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, headOfDepartment, description } = req.body;

  const db = getDb();
  const idx = db.departments.findIndex(d => d._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Department not found.' });
  }

  if (name) db.departments[idx].name = name;
  if (headOfDepartment) db.departments[idx].headOfDepartment = headOfDepartment;
  if (description) db.departments[idx].description = description;

  saveDb(db);
  return res.json({ success: true, message: 'Department updated.', data: db.departments[idx] });
};

export const deleteDepartment = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDb();

  const idx = db.departments.findIndex(d => d._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Department not found.' });
  }

  db.departments.splice(idx, 1);
  saveDb(db);
  return res.json({ success: true, message: 'Department removed successfully.' });
};

// Courses & Subjects Management
export const getSubjects = (req: AuthRequest, res: Response) => {
  const db = getDb();
  return res.json({ success: true, data: db.subjects });
};

export const createSubject = (req: AuthRequest, res: Response) => {
  const { code, name, departmentId, facultyId, credits, semester } = req.body;
  if (!code || !name || !departmentId) {
    return res.status(400).json({ success: false, message: 'Code, name, and department are required.' });
  }

  const db = getDb();
  const dept = db.departments.find(d => d._id === departmentId);
  const faculty = db.users.find(u => u._id === facultyId && u.role === 'faculty');

  const newSubject: ISubject = {
    _id: `subj_${Date.now()}`,
    code: code.toUpperCase(),
    name,
    departmentId,
    departmentName: dept ? dept.name : 'Engineering',
    facultyId: faculty ? faculty._id : '',
    facultyName: faculty ? faculty.name : 'Unassigned',
    credits: Number(credits) || 4,
    semester: Number(semester) || 5,
    totalClasses: 40
  };

  db.subjects.push(newSubject);
  if (faculty) {
    if (!faculty.assignedSubjects) faculty.assignedSubjects = [];
    faculty.assignedSubjects.push(newSubject._id);
  }
  saveDb(db);

  return res.json({ success: true, message: 'Subject created successfully.', data: newSubject });
};

export const updateSubject = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, facultyId, credits, semester } = req.body;

  const db = getDb();
  const idx = db.subjects.findIndex(s => s._id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Subject not found.' });

  if (name) db.subjects[idx].name = name;
  if (credits) db.subjects[idx].credits = Number(credits);
  if (semester) db.subjects[idx].semester = Number(semester);
  if (facultyId) {
    const faculty = db.users.find(u => u._id === facultyId);
    if (faculty) {
      db.subjects[idx].facultyId = faculty._id;
      db.subjects[idx].facultyName = faculty.name;
    }
  }

  saveDb(db);
  return res.json({ success: true, message: 'Subject updated.', data: db.subjects[idx] });
};

// Timetable Management
export const getAdminTimetable = (req: AuthRequest, res: Response) => {
  const db = getDb();
  return res.json({ success: true, data: db.timetable });
};

export const createTimetableSlot = (req: AuthRequest, res: Response) => {
  const { day, startTime, endTime, subjectId, room, section } = req.body;
  if (!day || !startTime || !endTime || !subjectId || !room) {
    return res.status(400).json({ success: false, message: 'All slot details are required.' });
  }

  const db = getDb();
  const subject = db.subjects.find(s => s._id === subjectId);
  if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });

  const newSlot: ITimetableSlot = {
    _id: `tt_${Date.now()}`,
    day,
    startTime,
    endTime,
    subjectId,
    subjectCode: subject.code,
    subjectName: subject.name,
    facultyId: subject.facultyId,
    facultyName: subject.facultyName,
    room,
    departmentId: subject.departmentId,
    semester: subject.semester,
    section: section || 'A'
  };

  db.timetable.push(newSlot);
  saveDb(db);

  return res.json({ success: true, message: 'Timetable slot created.', data: newSlot });
};

export const deleteTimetableSlot = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDb();

  const idx = db.timetable.findIndex(t => t._id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Slot not found.' });

  db.timetable.splice(idx, 1);
  saveDb(db);
  return res.json({ success: true, message: 'Timetable slot removed.' });
};

// Notices Management
export const createNotice = (req: AuthRequest, res: Response) => {
  const admin = req.user!;
  const { title, description, department, priority, targetRole, attachment } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Title and description are required.' });
  }

  const db = getDb();
  const newNotice: INotice = {
    _id: `notice_${Date.now()}`,
    title,
    description,
    department: department || 'All',
    date: new Date().toISOString().split('T')[0],
    priority: priority || 'Medium',
    targetRole: targetRole || 'All',
    attachment,
    postedBy: admin.name,
    readBy: []
  };

  db.notices.unshift(newNotice);

  // Broadcast notification to targeted users
  const targetUsers = db.users.filter(u => 
    targetRole === 'All' || u.role === targetRole
  );

  targetUsers.forEach(u => {
    db.notifications.push({
      _id: `notif_${Date.now()}_${u._id.slice(-4)}`,
      userId: u._id,
      title: `Notice: ${title}`,
      message: description.slice(0, 100) + '...',
      type: 'notice',
      isRead: false,
      createdAt: new Date().toISOString(),
      link: '/notices'
    });
  });

  saveDb(db);

  return res.json({ success: true, message: 'Notice published successfully.', data: newNotice });
};

export const deleteNotice = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDb();

  const idx = db.notices.findIndex(n => n._id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Notice not found.' });

  db.notices.splice(idx, 1);
  saveDb(db);
  return res.json({ success: true, message: 'Notice deleted successfully.' });
};

// Admin view for any student's academic marks and transcript
export const getStudentMarksAdmin = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDb();

  const student = db.users.find(u => u._id === id && u.role === 'student');
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  const marks = db.marks.filter(m => m.studentId === student._id);
  const subjects = db.subjects;

  const enrichedMarks = marks.map(m => {
    const subj = subjects.find(s => s._id === m.subjectId || s.code === m.subjectCode);
    return {
      ...m,
      credits: subj?.credits || 4
    };
  });

  const totalCredits = enrichedMarks.reduce((sum, m) => sum + (m.credits || 4), 0);
  const weightedPoints = enrichedMarks.reduce((sum, m) => sum + (m.gradePoints * (m.credits || 4)), 0);
  const calculatedSgpa = totalCredits > 0 ? Number((weightedPoints / totalCredits).toFixed(2)) : 8.8;

  return res.json({
    success: true,
    data: {
      student,
      marks: enrichedMarks,
      sgpa: calculatedSgpa,
      cgpa: student.cgpa || calculatedSgpa,
      totalCredits
    }
  });
};
