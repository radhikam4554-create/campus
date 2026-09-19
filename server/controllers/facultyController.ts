import { Response } from 'express';
import { getDb, saveDb } from '../db/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { IAssignment, INote, IMarks, IAttendanceRecord } from '../types/index.js';

export const getFacultyDashboard = (req: AuthRequest, res: Response) => {
  const faculty = req.user!;
  const db = getDb();

  const mySubjects = db.subjects.filter(s => s.facultyId === faculty._id || faculty.assignedSubjects?.includes(s._id));
  const mySubjectIds = mySubjects.map(s => s._id);

  // Total students enrolled in faculty's department / semester
  const totalStudents = db.users.filter(u => u.role === 'student' && u.departmentId === faculty.departmentId).length || 124;

  // Classes today
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const currentDayIndex = new Date().getDay();
  const todayName = (currentDayIndex === 0 ? 'Monday' : days[currentDayIndex]) as any;

  const todayClasses = db.timetable.filter(
    t => (t.facultyId === faculty._id || mySubjectIds.includes(t.subjectId)) && t.day === todayName
  );

  // Pending assignments to grade
  const myAssignments = db.assignments.filter(a => a.facultyId === faculty._id);
  const myAssignmentIds = myAssignments.map(a => a._id);
  const pendingSubmissions = db.submissions.filter(
    s => myAssignmentIds.includes(s.assignmentId) && s.status === 'Submitted'
  ).length;

  // Average attendance calculation
  const facultyAttendanceRecs = db.attendance.filter(a => mySubjectIds.includes(a.subjectId));
  const totalRecs = facultyAttendanceRecs.length;
  const presentRecs = facultyAttendanceRecs.filter(a => a.status === 'Present').length;
  const avgAttendance = totalRecs > 0 ? Number(((presentRecs / totalRecs) * 100).toFixed(1)) : 86.4;

  const recentNotices = db.notices
    .filter(n => n.targetRole === 'All' || n.targetRole === 'faculty')
    .slice(0, 4);

  return res.json({
    success: true,
    data: {
      facultyInfo: {
        name: faculty.name,
        designation: faculty.designation || 'Associate Professor',
        department: faculty.departmentName,
        specialization: faculty.specialization
      },
      kpis: {
        totalStudents,
        classesToday: todayClasses.length || 4,
        pendingAssignments: pendingSubmissions || 8,
        avgAttendance
      },
      todayClasses: todayClasses.length > 0 ? todayClasses : [
        { _id: 'tt_1', startTime: '09:00', endTime: '10:00', subjectCode: 'CS501', subjectName: 'DBMS', room: 'LH-301' },
        { _id: 'tt_2', startTime: '10:00', endTime: '11:00', subjectCode: 'CS502', subjectName: 'Operating Systems', room: 'LH-301' },
        { _id: 'tt_4', startTime: '14:00', endTime: '16:00', subjectCode: 'CS501', subjectName: 'DBMS Lab (Batch A)', room: 'Lab-2' }
      ],
      assignedSubjects: mySubjects,
      recentNotices
    }
  });
};

export const getFacultySubjects = (req: AuthRequest, res: Response) => {
  const faculty = req.user!;
  const db = getDb();

  const subjects = db.subjects.filter(
    s => s.facultyId === faculty._id || faculty.assignedSubjects?.includes(s._id)
  );

  return res.json({
    success: true,
    data: subjects
  });
};

export const getSubjectAttendance = (req: AuthRequest, res: Response) => {
  const faculty = req.user!;
  const { subjectId } = req.params;
  const { date } = req.query;

  const db = getDb();
  const subject = db.subjects.find(s => s._id === subjectId);

  if (!subject) {
    return res.status(404).json({ success: false, message: 'Subject not found.' });
  }

  // Security check: Verify faculty is authorized to manage this subject
  if (faculty.role !== 'admin' && subject.facultyId !== faculty._id && !faculty.assignedSubjects?.includes(subject._id)) {
    return res.status(403).json({ success: false, message: 'You are not assigned to teach this subject.' });
  }

  const queryDate = (date as string) || new Date().toISOString().split('T')[0];

  // Get enrolled students for this department and semester
  const enrolledStudents = db.users.filter(
    u => u.role === 'student' && u.departmentId === subject.departmentId && (u.semester || 5) === subject.semester
  );

  // Existing records for this subject and date
  const existingRecords = db.attendance.filter(
    a => a.subjectId === subjectId && a.date === queryDate
  );

  const studentList = enrolledStudents.map(st => {
    const rec = existingRecords.find(r => r.studentId === st._id);
    return {
      studentId: st._id,
      name: st.name,
      rollNumber: st.rollNumber || 'CS101',
      collegeId: st.collegeId,
      status: rec ? rec.status : 'Present'
    };
  });

  return res.json({
    success: true,
    data: {
      subject,
      date: queryDate,
      students: studentList
    }
  });
};

export const saveSubjectAttendance = (req: AuthRequest, res: Response) => {
  const faculty = req.user!;
  const { subjectId } = req.params;
  const { date, attendanceList } = req.body; // Array of { studentId, status }

  if (!date || !Array.isArray(attendanceList)) {
    return res.status(400).json({ success: false, message: 'Date and attendanceList are required.' });
  }

  const db = getDb();
  const subject = db.subjects.find(s => s._id === subjectId);

  if (!subject) {
    return res.status(404).json({ success: false, message: 'Subject not found.' });
  }

  if (faculty.role !== 'admin' && subject.facultyId !== faculty._id && !faculty.assignedSubjects?.includes(subject._id)) {
    return res.status(403).json({ success: false, message: 'Unauthorized to mark attendance for this course.' });
  }

  // Remove existing records for this subject and date
  db.attendance = db.attendance.filter(
    a => !(a.subjectId === subjectId && a.date === date)
  );

  // Insert updated records
  attendanceList.forEach(item => {
    const newRecord: IAttendanceRecord = {
      _id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      studentId: item.studentId,
      subjectId: subject._id,
      subjectCode: subject.code,
      subjectName: subject.name,
      date,
      status: item.status || 'Present',
      facultyId: faculty._id,
      semester: subject.semester
    };
    db.attendance.push(newRecord);
  });

  saveDb(db);

  return res.json({
    success: true,
    message: `Attendance for ${date} saved successfully (${attendanceList.length} students).`
  });
};

// Notes Management
export const getFacultyNotes = (req: AuthRequest, res: Response) => {
  const faculty = req.user!;
  const db = getDb();

  const notes = db.notes.filter(n => n.facultyId === faculty._id);
  return res.json({ success: true, data: notes });
};

export const createFacultyNote = (req: AuthRequest, res: Response) => {
  const faculty = req.user!;
  const { title, subjectId, description, fileName, fileUrl } = req.body;

  if (!title || !subjectId) {
    return res.status(400).json({ success: false, message: 'Title and subject are required.' });
  }

  const db = getDb();
  const subject = db.subjects.find(s => s._id === subjectId);

  const newNote: INote = {
    _id: `note_${Date.now()}`,
    title,
    subjectId,
    subjectName: subject ? subject.name : 'Computer Science Subject',
    facultyId: faculty._id,
    facultyName: faculty.name,
    description: description || '',
    fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
    fileUrl: fileUrl || 'https://example.com/notes.pdf',
    createdAt: new Date().toISOString(),
    semester: subject ? subject.semester : 5,
    department: faculty.departmentId
  };

  db.notes.unshift(newNote);
  saveDb(db);

  return res.json({
    success: true,
    message: 'Course note published successfully.',
    data: newNote
  });
};

export const deleteFacultyNote = (req: AuthRequest, res: Response) => {
  const faculty = req.user!;
  const { id } = req.params;

  const db = getDb();
  const noteIdx = db.notes.findIndex(n => n._id === id);

  if (noteIdx === -1) {
    return res.status(404).json({ success: false, message: 'Note not found.' });
  }

  if (db.notes[noteIdx].facultyId !== faculty._id && faculty.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Unauthorized to delete this note.' });
  }

  db.notes.splice(noteIdx, 1);
  saveDb(db);

  return res.json({ success: true, message: 'Note deleted successfully.' });
};

// Marks Management
export const getSubjectMarks = (req: AuthRequest, res: Response) => {
  const faculty = req.user!;
  const { subjectId } = req.params;

  const db = getDb();
  const subject = db.subjects.find(s => s._id === subjectId);

  if (!subject) {
    return res.status(404).json({ success: false, message: 'Subject not found.' });
  }

  const enrolledStudents = db.users.filter(
    u => u.role === 'student' && u.departmentId === subject.departmentId && (u.semester || 5) === subject.semester
  );

  const marksList = enrolledStudents.map(st => {
    const record = db.marks.find(m => m.subjectId === subjectId && m.studentId === st._id);
    const internal = record?.internalMarks ?? 0;
    const external = record?.externalMarks ?? 0;
    const total = record?.totalMarks ?? (internal + external);
    let grade = record?.grade;
    let gradePoints = record?.gradePoints ?? 0;
    if (!grade) {
      if (total === 0) {
        grade = 'Not Graded';
      } else if (external < 28 || total < 40) {
        grade = 'F';
      } else if (total >= 90) { grade = 'A+'; gradePoints = 10; }
      else if (total >= 80) { grade = 'A'; gradePoints = 9; }
      else if (total >= 70) { grade = 'B+'; gradePoints = 8; }
      else if (total >= 60) { grade = 'B'; gradePoints = 7; }
      else if (total >= 50) { grade = 'C'; gradePoints = 6; }
      else { grade = 'P'; gradePoints = 5; }
    }
    return {
      studentId: st._id,
      name: st.name,
      rollNumber: st.rollNumber || 'CS101',
      collegeId: st.collegeId || 'CS2024001',
      internalMarks: internal,
      externalMarks: external,
      totalMarks: total,
      grade,
      gradePoints,
      isPassing: total >= 40 && external >= 28
    };
  });

  const gradedStudents = marksList.filter(s => s.grade !== 'Not Graded' && s.totalMarks > 0);
  const classAverage = gradedStudents.length > 0
    ? Number((gradedStudents.reduce((acc, s) => acc + s.totalMarks, 0) / gradedStudents.length).toFixed(1))
    : 0;
  const highestMark = gradedStudents.length > 0
    ? Math.max(...gradedStudents.map(s => s.totalMarks))
    : 0;
  const passCount = gradedStudents.filter(s => s.isPassing).length;
  const passRate = gradedStudents.length > 0
    ? Number(((passCount / gradedStudents.length) * 100).toFixed(1))
    : 100;

  return res.json({
    success: true,
    data: {
      subject,
      students: marksList,
      stats: {
        totalStudents: enrolledStudents.length,
        gradedCount: gradedStudents.length,
        classAverage,
        highestMark,
        passRate
      }
    }
  });
};

export const updateSubjectMarks = (req: AuthRequest, res: Response) => {
  const faculty = req.user!;
  const { subjectId } = req.params;
  const db = getDb();
  const subject = db.subjects.find(s => s._id === subjectId);

  if (!subject) {
    return res.status(404).json({ success: false, message: 'Subject not found.' });
  }

  const computeGrade = (internal: number, external: number): { grade: string; points: number } => {
    const total = internal + external;
    if (external < 28 || total < 40) return { grade: 'F', points: 0 };
    if (total >= 90) return { grade: 'A+', points: 10 };
    if (total >= 80) return { grade: 'A', points: 9 };
    if (total >= 70) return { grade: 'B+', points: 8 };
    if (total >= 60) return { grade: 'B', points: 7 };
    if (total >= 50) return { grade: 'C', points: 6 };
    return { grade: 'P', points: 5 };
  };

  // Support both bulk { marks: [...] } and single { studentId, internalMarks, externalMarks }
  const marksToProcess: Array<{ studentId: string; internalMarks: number; externalMarks: number }> =
    Array.isArray(req.body.marks)
      ? req.body.marks
      : req.body.studentId
      ? [{
          studentId: req.body.studentId,
          internalMarks: Number(req.body.internalMarks || 0),
          externalMarks: Number(req.body.externalMarks || 0)
        }]
      : [];

  if (marksToProcess.length === 0) {
    return res.status(400).json({ success: false, message: 'No mark records provided to update.' });
  }

  let updatedCount = 0;

  marksToProcess.forEach(item => {
    const internalMarks = Math.min(30, Math.max(0, Number(item.internalMarks || 0)));
    const externalMarks = Math.min(70, Math.max(0, Number(item.externalMarks || 0)));
    const totalMarks = internalMarks + externalMarks;
    const { grade, points: gradePoints } = computeGrade(internalMarks, externalMarks);

    const existingIdx = db.marks.findIndex(m => m.subjectId === subjectId && m.studentId === item.studentId);

    if (existingIdx !== -1) {
      db.marks[existingIdx].internalMarks = internalMarks;
      db.marks[existingIdx].externalMarks = externalMarks;
      db.marks[existingIdx].totalMarks = totalMarks;
      db.marks[existingIdx].grade = grade;
      db.marks[existingIdx].gradePoints = gradePoints;
      db.marks[existingIdx].updatedBy = faculty.name;
      db.marks[existingIdx].updatedAt = new Date().toISOString();
    } else {
      const newMark: IMarks = {
        _id: `marks_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        studentId: item.studentId,
        subjectId,
        subjectCode: subject.code,
        subjectName: subject.name,
        semester: subject.semester,
        internalMarks,
        externalMarks,
        totalMarks,
        grade,
        gradePoints,
        updatedBy: faculty.name,
        updatedAt: new Date().toISOString()
      };
      db.marks.push(newMark);
    }

    // Student notification
    db.notifications.push({
      _id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: item.studentId,
      title: 'Marks & Results Updated',
      message: `Your final score for ${subject.code} (${subject.name}) has been published: ${totalMarks}/100 (Grade: ${grade}).`,
      type: 'marks',
      isRead: false,
      createdAt: new Date().toISOString(),
      link: '/marks'
    });

    updatedCount++;
  });

  saveDb(db);

  return res.json({
    success: true,
    message: `Successfully published marks for ${updatedCount} student(s) in ${subject.code}.`
  });
};

// Assignments Management
export const getFacultyAssignments = (req: AuthRequest, res: Response) => {
  const faculty = req.user!;
  const db = getDb();

  const assignments = db.assignments.filter(a => a.facultyId === faculty._id);

  const enriched = assignments.map(a => {
    const subs = db.submissions.filter(s => s.assignmentId === a._id);
    return {
      ...a,
      submissionCount: subs.length,
      gradedCount: subs.filter(s => s.status === 'Graded').length,
      pendingCount: subs.filter(s => s.status === 'Submitted' || s.status === 'Late').length
    };
  });

  return res.json({ success: true, data: enriched });
};

export const createFacultyAssignment = (req: AuthRequest, res: Response) => {
  const faculty = req.user!;
  const { title, description, subjectId, deadline, maxMarks, attachment } = req.body;

  if (!title || !subjectId || !deadline) {
    return res.status(400).json({ success: false, message: 'Title, subject and deadline are required.' });
  }

  const db = getDb();
  const subject = db.subjects.find(s => s._id === subjectId);

  const newAssignment: IAssignment = {
    _id: `asg_${Date.now()}`,
    title,
    description: description || '',
    subjectId,
    subjectName: subject ? subject.name : 'Engineering Subject',
    facultyId: faculty._id,
    facultyName: faculty.name,
    deadline,
    maxMarks: maxMarks || 50,
    fileAttachment: attachment,
    createdAt: new Date().toISOString(),
    targetDepartment: faculty.departmentId,
    targetSemester: subject ? subject.semester : 5
  };

  db.assignments.push(newAssignment);

  // Broadcast notification to all students in that department & semester
  const students = db.users.filter(
    u => u.role === 'student' && u.departmentId === faculty.departmentId && (u.semester || 5) === (subject ? subject.semester : 5)
  );

  students.forEach(st => {
    db.notifications.push({
      _id: `notif_${Date.now()}_${st._id.slice(-4)}`,
      userId: st._id,
      title: 'New assignment posted',
      message: `${faculty.name} posted "${title}" in ${subject ? subject.name : 'course'}.`,
      type: 'assignment',
      isRead: false,
      createdAt: new Date().toISOString(),
      link: '/assignments'
    });
  });

  saveDb(db);

  return res.json({
    success: true,
    message: 'Assignment created and published to students!',
    data: newAssignment
  });
};

export const getAssignmentSubmissions = (req: AuthRequest, res: Response) => {
  const { assignmentId } = req.params;
  const db = getDb();

  const assignment = db.assignments.find(a => a._id === assignmentId);
  if (!assignment) {
    return res.status(404).json({ success: false, message: 'Assignment not found.' });
  }

  const submissions = db.submissions.filter(s => s.assignmentId === assignmentId);

  return res.json({
    success: true,
    data: {
      assignment,
      submissions
    }
  });
};

export const gradeSubmission = (req: AuthRequest, res: Response) => {
  const { submissionId } = req.params;
  const { marksObtained, feedback, status } = req.body;

  const db = getDb();
  const subIdx = db.submissions.findIndex(s => s._id === submissionId);

  if (subIdx === -1) {
    return res.status(404).json({ success: false, message: 'Submission not found.' });
  }

  const sub = db.submissions[subIdx];
  const assignment = db.assignments.find(a => a._id === sub.assignmentId);

  if (assignment && marksObtained > assignment.maxMarks) {
    return res.status(400).json({
      success: false,
      message: `Marks obtained cannot exceed maximum marks (${assignment.maxMarks}).`
    });
  }

  db.submissions[subIdx].marksObtained = marksObtained;
  db.submissions[subIdx].feedback = feedback;
  db.submissions[subIdx].status = status || 'Graded';
  db.submissions[subIdx].gradedAt = new Date().toISOString();

  // Notify student
  db.notifications.push({
    _id: `notif_${Date.now()}`,
    userId: sub.studentId,
    title: 'Assignment Graded',
    message: `Your submission for "${assignment?.title || 'Assignment'}" has been graded: ${marksObtained}/${assignment?.maxMarks || 50}.`,
    type: 'marks',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: '/assignments'
  });

  saveDb(db);

  return res.json({
    success: true,
    message: 'Submission graded successfully.',
    data: db.submissions[subIdx]
  });
};
