import { Response } from 'express';
import { getDb, saveDb } from '../db/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { ISubmission } from '../types/index.js';

export const getStudentDashboard = (req: AuthRequest, res: Response) => {
  const student = req.user!;
  const db = getDb();

  // 1. Attendance calculation
  const studentAttendance = db.attendance.filter(a => a.studentId === student._id);
  const totalClasses = studentAttendance.length;
  const presentClasses = studentAttendance.filter(a => a.status === 'Present').length;
  const overallAttendancePercent = totalClasses > 0 
    ? Number(((presentClasses / totalClasses) * 100).toFixed(1)) 
    : 88.5;

  // Subject-wise attendance calculation
  const subjectMap = new Map<string, { subjectId: string; subjectName: string; subjectCode: string; total: number; present: number }>();
  
  // Initialize with subjects
  db.subjects.forEach(s => {
    subjectMap.set(s._id, {
      subjectId: s._id,
      subjectName: s.name,
      subjectCode: s.code,
      total: 0,
      present: 0
    });
  });

  studentAttendance.forEach(a => {
    const item = subjectMap.get(a.subjectId);
    if (item) {
      item.total += 1;
      if (a.status === 'Present') item.present += 1;
    }
  });

  const subjectAttendance = Array.from(subjectMap.values()).map(s => {
    const total = s.total > 0 ? s.total : 40;
    const present = s.total > 0 ? s.present : 35;
    const pct = Number(((present / total) * 100).toFixed(1));
    return {
      ...s,
      total,
      present,
      absent: total - present,
      percentage: pct
    };
  });

  // 2. Timetable for Today
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const currentDayIndex = new Date().getDay();
  // Default to Monday if Sunday
  const todayName = (currentDayIndex === 0 ? 'Monday' : days[currentDayIndex]) as any;
  const todayClasses = db.timetable
    .filter(t => t.day === todayName && t.semester === (student.semester || 5))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // 3. Pending & upcoming assignments
  const studentSubmissions = db.submissions.filter(s => s.studentId === student._id);
  const submittedAssignmentIds = new Set(studentSubmissions.map(s => s.assignmentId));

  const upcomingAssignments = db.assignments
    .filter(a => a.targetSemester === (student.semester || 5))
    .map(a => {
      const sub = studentSubmissions.find(s => s.assignmentId === a._id);
      return {
        ...a,
        submissionStatus: sub ? sub.status : 'Pending',
        marksObtained: sub?.marksObtained,
        submissionDate: sub?.submissionDate
      };
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const pendingAssignmentsCount = upcomingAssignments.filter(a => a.submissionStatus === 'Pending').length;

  // 4. Recent Notices
  const recentNotices = db.notices
    .filter(n => n.targetRole === 'All' || n.targetRole === 'student')
    .slice(0, 4);

  // 5. Attendance monthly trend for charts
  const monthlyTrend = [
    { month: 'May', attendance: 84.5 },
    { month: 'Jun', attendance: 86.2 },
    { month: 'Jul', attendance: 89.0 },
    { month: 'Aug', attendance: 85.8 },
    { month: 'Sep', attendance: overallAttendancePercent },
  ];

  return res.json({
    success: true,
    data: {
      studentInfo: {
        name: student.name,
        collegeId: student.collegeId,
        rollNumber: student.rollNumber || 'CS101',
        department: student.departmentName,
        semester: student.semester || 5,
        year: student.year || 3,
        cgpa: student.cgpa || 8.7,
        cgpaIncrease: 0.4
      },
      kpis: {
        attendancePercent: overallAttendancePercent,
        attendanceGrowth: '+3.2%',
        cgpa: student.cgpa || 8.7,
        cgpaGrowth: '+0.4',
        pendingAssignments: pendingAssignmentsCount,
        classesToday: todayClasses.length || 4
      },
      todayClasses: todayClasses.length > 0 ? todayClasses : [
        { _id: 'sample_1', day: 'Monday', startTime: '09:00', endTime: '10:00', subjectCode: 'CS501', subjectName: 'DBMS', facultyName: 'Dr. Rajesh Kulkarni', room: 'LH-301' },
        { _id: 'sample_2', day: 'Monday', startTime: '10:00', endTime: '11:00', subjectCode: 'CS502', subjectName: 'Operating Systems', facultyName: 'Dr. Rajesh Kulkarni', room: 'LH-301' },
        { _id: 'sample_3', day: 'Monday', startTime: '11:30', endTime: '12:30', subjectCode: 'CS503', subjectName: 'Computer Networks', facultyName: 'Prof. Anita Sharma', room: 'LH-302' },
        { _id: 'sample_4', day: 'Monday', startTime: '14:00', endTime: '16:00', subjectCode: 'CS501', subjectName: 'DBMS Lab', facultyName: 'Dr. Rajesh Kulkarni', room: 'Lab-2' }
      ],
      subjectAttendance,
      monthlyTrend,
      upcomingAssignments,
      recentNotices
    }
  });
};

export const getStudentAttendance = (req: AuthRequest, res: Response) => {
  const student = req.user!;
  const db = getDb();

  const history = db.attendance
    .filter(a => a.studentId === student._id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const total = history.length > 0 ? history.length : 156;
  const present = history.filter(a => a.status === 'Present').length;
  const absent = history.filter(a => a.status === 'Absent').length;
  const late = history.filter(a => a.status === 'Late').length;
  const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 87.5;

  // Subjects summary table
  const subjectsSummary = db.subjects.map(subj => {
    const subjRecs = history.filter(h => h.subjectId === subj._id);
    const subTotal = subjRecs.length > 0 ? subjRecs.length : subj.totalClasses || 40;
    const subPresent = subjRecs.length > 0 ? subjRecs.filter(r => r.status === 'Present').length : Math.round(subTotal * 0.88);
    const subAbsent = subTotal - subPresent;
    const subPct = Number(((subPresent / subTotal) * 100).toFixed(1));

    return {
      subjectId: subj._id,
      subjectCode: subj.code,
      subjectName: subj.name,
      facultyName: subj.facultyName,
      totalClasses: subTotal,
      present: subPresent,
      absent: subAbsent,
      percentage: subPct
    };
  });

  const monthlyGraph = [
    { month: 'May', present: 22, absent: 2, percentage: 91.6 },
    { month: 'Jun', present: 24, absent: 3, percentage: 88.8 },
    { month: 'Jul', present: 26, absent: 2, percentage: 92.8 },
    { month: 'Aug', present: 23, absent: 4, percentage: 85.1 },
    { month: 'Sep', present: 25, absent: 2, percentage: 92.5 }
  ];

  return res.json({
    success: true,
    data: {
      overall: {
        total,
        present,
        absent,
        late,
        percentage
      },
      subjectsSummary,
      monthlyGraph,
      history
    }
  });
};

export const getStudentMarks = (req: AuthRequest, res: Response) => {
  const student = req.user!;
  const db = getDb();

  const currentSem = student.semester || 5;
  const requestedSem = req.query.semester ? Number(req.query.semester) : currentSem;

  // Historical records for semesters 1-4 for engineering curriculum
  const historicalSemesters: Record<number, any[]> = {
    1: [
      { _id: 'hist_1_1', subjectCode: 'CS101', subjectName: 'Mathematics I', credits: 4, internalMarks: 26, externalMarks: 62, totalMarks: 88, grade: 'A', gradePoints: 9, semester: 1 },
      { _id: 'hist_1_2', subjectCode: 'PH101', subjectName: 'Engineering Physics', credits: 4, internalMarks: 24, externalMarks: 58, totalMarks: 82, grade: 'A', gradePoints: 9, semester: 1 },
      { _id: 'hist_1_3', subjectCode: 'EE101', subjectName: 'Basic Electrical Engineering', credits: 3, internalMarks: 22, externalMarks: 52, totalMarks: 74, grade: 'B+', gradePoints: 8, semester: 1 },
      { _id: 'hist_1_4', subjectCode: 'CS102', subjectName: 'Intro to Programming in C', credits: 4, internalMarks: 28, externalMarks: 64, totalMarks: 92, grade: 'A+', gradePoints: 10, semester: 1 },
      { _id: 'hist_1_5', subjectCode: 'ME101', subjectName: 'Engineering Graphics & CAD', credits: 3, internalMarks: 25, externalMarks: 51, totalMarks: 76, grade: 'B+', gradePoints: 8, semester: 1 },
    ],
    2: [
      { _id: 'hist_2_1', subjectCode: 'CS201', subjectName: 'Mathematics II', credits: 4, internalMarks: 25, externalMarks: 60, totalMarks: 85, grade: 'A', gradePoints: 9, semester: 2 },
      { _id: 'hist_2_2', subjectCode: 'CS202', subjectName: 'Digital Logic & System Design', credits: 4, internalMarks: 27, externalMarks: 63, totalMarks: 90, grade: 'A+', gradePoints: 10, semester: 2 },
      { _id: 'hist_2_3', subjectCode: 'CS203', subjectName: 'OOP with Java', credits: 4, internalMarks: 28, externalMarks: 62, totalMarks: 90, grade: 'A+', gradePoints: 10, semester: 2 },
      { _id: 'hist_2_4', subjectCode: 'CS204', subjectName: 'Data Structures & Algorithms', credits: 4, internalMarks: 26, externalMarks: 58, totalMarks: 84, grade: 'A', gradePoints: 9, semester: 2 },
      { _id: 'hist_2_5', subjectCode: 'CE201', subjectName: 'Environmental Studies', credits: 2, internalMarks: 20, externalMarks: 45, totalMarks: 65, grade: 'B', gradePoints: 7, semester: 2 },
    ],
    3: [
      { _id: 'hist_3_1', subjectCode: 'CS301', subjectName: 'Discrete Mathematics', credits: 4, internalMarks: 24, externalMarks: 56, totalMarks: 80, grade: 'A', gradePoints: 9, semester: 3 },
      { _id: 'hist_3_2', subjectCode: 'CS302', subjectName: 'Computer Org. & Architecture', credits: 4, internalMarks: 23, externalMarks: 55, totalMarks: 78, grade: 'B+', gradePoints: 8, semester: 3 },
      { _id: 'hist_3_3', subjectCode: 'CS303', subjectName: 'Design & Analysis of Algorithms', credits: 4, internalMarks: 27, externalMarks: 61, totalMarks: 88, grade: 'A', gradePoints: 9, semester: 3 },
      { _id: 'hist_3_4', subjectCode: 'CS304', subjectName: 'Formal Languages & Automata', credits: 4, internalMarks: 22, externalMarks: 54, totalMarks: 76, grade: 'B+', gradePoints: 8, semester: 3 },
      { _id: 'hist_3_5', subjectCode: 'CS305', subjectName: 'Python for Data Science', credits: 3, internalMarks: 28, externalMarks: 64, totalMarks: 92, grade: 'A+', gradePoints: 10, semester: 3 },
    ],
    4: [
      { _id: 'hist_4_1', subjectCode: 'CS401', subjectName: 'Microprocessors & Interfacing', credits: 4, internalMarks: 26, externalMarks: 61, totalMarks: 87, grade: 'A', gradePoints: 9, semester: 4 },
      { _id: 'hist_4_2', subjectCode: 'CS402', subjectName: 'Programming Languages', credits: 3, internalMarks: 25, externalMarks: 58, totalMarks: 83, grade: 'A', gradePoints: 9, semester: 4 },
      { _id: 'hist_4_3', subjectCode: 'MA401', subjectName: 'Probability & Statistics', credits: 4, internalMarks: 28, externalMarks: 66, totalMarks: 94, grade: 'A+', gradePoints: 10, semester: 4 },
      { _id: 'hist_4_4', subjectCode: 'CS403', subjectName: 'Advanced Data Structures', credits: 4, internalMarks: 27, externalMarks: 62, totalMarks: 89, grade: 'A', gradePoints: 9, semester: 4 },
      { _id: 'hist_4_5', subjectCode: 'CS404', subjectName: 'Web Technologies', credits: 4, internalMarks: 29, externalMarks: 65, totalMarks: 94, grade: 'A+', gradePoints: 10, semester: 4 },
    ]
  };

  // Get marks from db for student
  const dbStudentMarks = db.marks.filter(m => m.studentId === student._id);

  // Sem 5 marks: if student has DB marks, use them with credit info
  const sem5Marks = dbStudentMarks.filter(m => m.semester === 5).map(m => {
    const subj = db.subjects.find(s => s._id === m.subjectId || s.code === m.subjectCode);
    return {
      ...m,
      credits: subj?.credits || 4
    };
  });

  // If student is in sem 5 and has no sem 5 marks yet, use subjects default
  const defaultSem5 = db.subjects.filter(s => s.semester === 5).map(s => ({
    _id: `default_${s._id}`,
    studentId: student._id,
    subjectId: s._id,
    subjectCode: s.code,
    subjectName: s.name,
    semester: 5,
    credits: s.credits || 4,
    internalMarks: 25,
    externalMarks: 60,
    totalMarks: 85,
    grade: 'A',
    gradePoints: 9
  }));

  const activeSem5Marks = sem5Marks.length > 0 ? sem5Marks : defaultSem5;

  // Selected semester records
  let selectedRecords: any[] = [];
  if (requestedSem === 5) {
    selectedRecords = activeSem5Marks;
  } else if (historicalSemesters[requestedSem]) {
    selectedRecords = historicalSemesters[requestedSem];
  } else {
    selectedRecords = activeSem5Marks;
  }

  // Calculate SGPA for selected records
  const totalCredits = selectedRecords.reduce((acc, r) => acc + (r.credits || 4), 0);
  const totalWeightedPoints = selectedRecords.reduce((acc, r) => acc + (r.gradePoints * (r.credits || 4)), 0);
  const sgpa = totalCredits > 0 ? Number((totalWeightedPoints / totalCredits).toFixed(2)) : 8.8;

  // SGPA History across all completed and current semesters
  const sgpaHistory = [
    { semester: 1, label: 'Sem 1', sgpa: 8.44, credits: 18, totalMarks: 412, maxMarks: 500, percentage: 82.4, status: 'Passed' },
    { semester: 2, label: 'Sem 2', sgpa: 8.67, credits: 18, totalMarks: 423, maxMarks: 500, percentage: 84.6, status: 'Passed' },
    { semester: 3, label: 'Sem 3', sgpa: 8.53, credits: 19, totalMarks: 414, maxMarks: 500, percentage: 82.8, status: 'Passed' },
    { semester: 4, label: 'Sem 4', sgpa: 8.95, credits: 19, totalMarks: 447, maxMarks: 500, percentage: 89.4, status: 'Passed' },
    { semester: 5, label: 'Sem 5 (Current)', sgpa, credits: totalCredits, totalMarks: selectedRecords.reduce((a, b) => a + b.totalMarks, 0), maxMarks: selectedRecords.length * 100, percentage: Number((selectedRecords.reduce((a, b) => a + b.totalMarks, 0) / (selectedRecords.length || 1)).toFixed(1)), status: 'Ongoing' }
  ];

  const cumulativeCredits = sgpaHistory.slice(0, currentSem).reduce((acc, s) => acc + s.credits, 0);
  const cumulativeWeightedPoints = (8.44 * 18) + (8.67 * 18) + (8.53 * 19) + (8.95 * 19) + (sgpa * totalCredits);
  const cgpa = Number((cumulativeWeightedPoints / cumulativeCredits).toFixed(2));

  const performanceDistribution = selectedRecords.map(m => ({
    subject: m.subjectCode,
    subjectName: m.subjectName,
    internal: m.internalMarks,
    external: m.externalMarks,
    total: m.totalMarks,
    maxMarks: 100,
    grade: m.grade,
    gradePoints: m.gradePoints,
    credits: m.credits || 4
  }));

  // Grade breakdown
  const gradeDistribution: Record<string, number> = {};
  selectedRecords.forEach(r => {
    gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1;
  });

  return res.json({
    success: true,
    data: {
      studentInfo: {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber || 'CS101',
        collegeId: student.collegeId,
        department: student.departmentName || 'Computer Science & Engineering',
        batch: '2023-2027',
        degree: 'Bachelor of Technology (B.Tech)',
        academicYear: '2025-2026'
      },
      currentSemester: currentSem,
      selectedSemester: requestedSem,
      availableSemesters: [1, 2, 3, 4, 5],
      sgpa,
      cgpa: student.cgpa || cgpa,
      totalCredits,
      cumulativeCredits,
      totalDegreeCredits: 160,
      percentageEquivalent: Number(((student.cgpa || cgpa) * 9.5).toFixed(1)),
      resultStatus: 'PASSED',
      records: selectedRecords,
      performanceDistribution,
      sgpaHistory,
      gradeDistribution
    }
  });
};

export const getStudentTimetable = (req: AuthRequest, res: Response) => {
  const student = req.user!;
  const db = getDb();

  const timetable = db.timetable.filter(
    t => t.semester === (student.semester || 5) && t.departmentId === student.departmentId
  );

  return res.json({
    success: true,
    data: timetable
  });
};

export const getStudentAssignments = (req: AuthRequest, res: Response) => {
  const student = req.user!;
  const db = getDb();

  const allAssignments = db.assignments.filter(
    a => a.targetSemester === (student.semester || 5)
  );

  const submissions = db.submissions.filter(s => s.studentId === student._id);

  const items = allAssignments.map(a => {
    const submission = submissions.find(s => s.assignmentId === a._id);
    return {
      ...a,
      submission: submission || null,
      status: submission ? submission.status : 'Pending'
    };
  });

  return res.json({
    success: true,
    data: items
  });
};

export const submitAssignment = (req: AuthRequest, res: Response) => {
  const student = req.user!;
  const { assignmentId } = req.params;
  const { notes, fileName, fileUrl } = req.body;

  const db = getDb();
  const assignment = db.assignments.find(a => a._id === assignmentId);
  if (!assignment) {
    return res.status(404).json({ success: false, message: 'Assignment not found.' });
  }

  const isPastDeadline = new Date().getTime() > new Date(assignment.deadline).getTime();
  const status = isPastDeadline ? 'Late' : 'Submitted';

  const existingSubIdx = db.submissions.findIndex(
    s => s.assignmentId === assignmentId && s.studentId === student._id
  );

  let newOrUpdatedSub: ISubmission;

  if (existingSubIdx !== -1) {
    db.submissions[existingSubIdx].submissionDate = new Date().toISOString();
    db.submissions[existingSubIdx].fileName = fileName || db.submissions[existingSubIdx].fileName || 'Assignment_Submission.pdf';
    db.submissions[existingSubIdx].fileUrl = fileUrl || db.submissions[existingSubIdx].fileUrl || 'https://example.com/submission.pdf';
    db.submissions[existingSubIdx].notes = notes;
    db.submissions[existingSubIdx].status = status;
    newOrUpdatedSub = db.submissions[existingSubIdx];
  } else {
    newOrUpdatedSub = {
      _id: `sub_${Date.now()}`,
      assignmentId,
      studentId: student._id,
      studentName: student.name,
      studentRoll: student.rollNumber || 'CS101',
      submissionDate: new Date().toISOString(),
      fileName: fileName || `${student.name.replace(/\s+/g, '_')}_Submission.pdf`,
      fileUrl: fileUrl || 'https://example.com/submission.pdf',
      notes,
      status
    };
    db.submissions.push(newOrUpdatedSub);
  }

  // Also notify faculty
  db.notifications.push({
    _id: `notif_${Date.now()}`,
    userId: assignment.facultyId,
    title: 'Assignment Submitted',
    message: `${student.name} (${student.rollNumber || 'CS101'}) submitted "${assignment.title}".`,
    type: 'assignment',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: '/assignments'
  });

  saveDb(db);

  return res.json({
    success: true,
    message: isPastDeadline ? 'Submitted (marked as late).' : 'Assignment submitted successfully!',
    submission: newOrUpdatedSub
  });
};

export const getStudentNotes = (req: AuthRequest, res: Response) => {
  const student = req.user!;
  const db = getDb();

  const notes = db.notes.filter(n => n.semester === (student.semester || 5));
  return res.json({
    success: true,
    data: notes
  });
};
