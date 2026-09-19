import { Response } from 'express';
import { getDb } from '../db/index.js';
import { AuthRequest } from '../middleware/auth.js';

export const globalSearch = (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const query = (req.query.q as string || '').toLowerCase().trim();

  if (!query) {
    return res.json({ success: true, data: { results: [] } });
  }

  const db = getDb();
  const results: Array<{ type: string; title: string; subtitle: string; link: string; id: string }> = [];

  // Search Notices (available to all according to role)
  db.notices
    .filter(n => (n.targetRole === 'All' || n.targetRole === user.role || user.role === 'admin') &&
      (n.title.toLowerCase().includes(query) || n.description.toLowerCase().includes(query))
    )
    .forEach(n => {
      results.push({
        type: 'Notice',
        title: n.title,
        subtitle: `${n.priority} Priority · ${n.date}`,
        link: '/notices',
        id: n._id
      });
    });

  // Search Subjects (courses)
  db.subjects
    .filter(s => s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query))
    .forEach(s => {
      results.push({
        type: 'Subject',
        title: `${s.code}: ${s.name}`,
        subtitle: `Faculty: ${s.facultyName} · ${s.credits} Credits`,
        link: user.role === 'student' ? '/timetable' : user.role === 'faculty' ? '/attendance' : '/admin/courses',
        id: s._id
      });
    });

  // Search Assignments
  db.assignments
    .filter(a => a.title.toLowerCase().includes(query) || a.subjectName.toLowerCase().includes(query))
    .forEach(a => {
      results.push({
        type: 'Assignment',
        title: a.title,
        subtitle: `${a.subjectName} · Due ${a.deadline.split('T')[0]}`,
        link: '/assignments',
        id: a._id
      });
    });

  // Search Faculty (public directory)
  db.users
    .filter(u => u.role === 'faculty' && (u.name.toLowerCase().includes(query) || u.departmentName.toLowerCase().includes(query)))
    .forEach(f => {
      results.push({
        type: 'Faculty',
        title: f.name,
        subtitle: `${f.designation || 'Faculty'} · ${f.departmentName}`,
        link: user.role === 'admin' ? '/admin/faculty' : '#',
        id: f._id
      });
    });

  // Search Students (Faculty and Admins only, to prevent exposing student privacy)
  if (user.role === 'admin' || user.role === 'faculty') {
    db.users
      .filter(u => u.role === 'student' && (u.name.toLowerCase().includes(query) || u.collegeId.toLowerCase().includes(query) || (u.rollNumber && u.rollNumber.toLowerCase().includes(query))))
      .forEach(s => {
        results.push({
          type: 'Student',
          title: s.name,
          subtitle: `Roll: ${s.rollNumber || 'N/A'} · ${s.collegeId} · ${s.departmentName}`,
          link: user.role === 'admin' ? '/admin/students' : '/attendance',
          id: s._id
        });
      });
  }

  return res.json({
    success: true,
    data: {
      query,
      results: results.slice(0, 10)
    }
  });
};
