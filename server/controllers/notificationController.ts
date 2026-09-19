import { Response } from 'express';
import { getDb, saveDb } from '../db/index.js';
import { AuthRequest } from '../middleware/auth.js';

export const getNotifications = (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const db = getDb();

  const userNotifications = db.notifications
    .filter(n => n.userId === user._id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({
    success: true,
    data: userNotifications
  });
};

export const markNotificationAsRead = (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const db = getDb();
  const idx = db.notifications.findIndex(n => n._id === id && n.userId === user._id);

  if (idx !== -1) {
    db.notifications[idx].isRead = true;
    saveDb(db);
  }

  return res.json({ success: true, message: 'Notification marked as read.' });
};

export const markAllNotificationsAsRead = (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const db = getDb();

  db.notifications.forEach(n => {
    if (n.userId === user._id) {
      n.isRead = true;
    }
  });

  saveDb(db);
  return res.json({ success: true, message: 'All notifications marked as read.' });
};
