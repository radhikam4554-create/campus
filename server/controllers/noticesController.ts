import { Response } from 'express';
import { getDb, saveDb } from '../db/index.js';
import { AuthRequest } from '../middleware/auth.js';

export const getNotices = (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const db = getDb();

  // Role-based visibility
  const visibleNotices = db.notices
    .filter(n => n.targetRole === 'All' || n.targetRole === user.role || user.role === 'admin')
    .map(n => ({
      ...n,
      isRead: n.readBy.includes(user._id)
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return res.json({
    success: true,
    data: visibleNotices
  });
};

export const markNoticeAsRead = (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const db = getDb();
  const notice = db.notices.find(n => n._id === id);

  if (notice && !notice.readBy.includes(user._id)) {
    notice.readBy.push(user._id);
    saveDb(db);
  }

  return res.json({ success: true, message: 'Notice marked as read.' });
};
