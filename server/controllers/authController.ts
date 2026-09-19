import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, saveDb } from '../db/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { IUser } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect-super-secure-jwt-secret-key-2025';

function sanitizeUser(user: IUser) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export const login = (req: Request, res: Response) => {
  const { identifier, password, role } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both College ID / Email and Password.'
    });
  }

  const db = getDb();
  const trimmedId = identifier.trim().toLowerCase();

  const user = db.users.find(u => 
    (u.collegeId.toLowerCase() === trimmedId || u.email.toLowerCase() === trimmedId) &&
    u.isActive
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Account not found. Please check your College ID or Email.'
    });
  }

  if (role && user.role !== role) {
    return res.status(403).json({
      success: false,
      message: `Account is registered as ${user.role.toUpperCase()}, not ${role.toUpperCase()}.`
    });
  }

  const isPasswordValid = user.password ? bcrypt.compareSync(password, user.password) : false;
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect password. Please verify credentials.'
    });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'Authentication successful.',
    token,
    user: sanitizeUser(user)
  });
};

export const googleAuth = (req: Request, res: Response) => {
  const { email, name, avatar, roleHint } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Google Email is required.'
    });
  }

  const db = getDb();
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Auto provision new campus student account for Google login
    const targetRole = (roleHint as 'student' | 'faculty') || 'student';
    const newId = `user_${targetRole}_${Date.now()}`;
    const collegeId = targetRole === 'faculty' ? `FAC${Date.now().toString().slice(-6)}` : `CS${Date.now().toString().slice(-6)}`;

    user = {
      _id: newId,
      collegeId,
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      role: targetRole,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      departmentId: 'dept_cs',
      departmentName: 'Computer Science & Engineering',
      phone: '+1 (555) 010-0000',
      isActive: true,
      createdAt: new Date().toISOString(),
      rollNumber: targetRole === 'student' ? `CS${Math.floor(100 + Math.random() * 900)}` : undefined,
      semester: targetRole === 'student' ? 5 : undefined,
      year: targetRole === 'student' ? 3 : undefined,
      batch: '2023-2027',
      section: 'A',
      cgpa: targetRole === 'student' ? 8.5 : undefined,
      designation: targetRole === 'faculty' ? 'Assistant Professor' : undefined,
      specialization: targetRole === 'faculty' ? 'Distributed Systems' : undefined,
      assignedSubjects: targetRole === 'faculty' ? ['subj_dbms'] : undefined
    };

    db.users.push(user);
    saveDb(db);
  }

  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'Google authentication successful.',
    token,
    user: sanitizeUser(user)
  });
};

export const getMe = (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const db = getDb();
  // Count unread notifications
  const unreadNotifications = db.notifications.filter(
    n => n.userId === req.user!._id && !n.isRead
  ).length;

  return res.json({
    success: true,
    user: sanitizeUser(req.user),
    unreadNotifications
  });
};

export const updateProfile = (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const { name, phone, avatar } = req.body;
  const db = getDb();
  const userIdx = db.users.findIndex(u => u._id === req.user!._id);

  if (userIdx === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (name) db.users[userIdx].name = name;
  if (phone) db.users[userIdx].phone = phone;
  if (avatar) db.users[userIdx].avatar = avatar;

  saveDb(db);

  return res.json({
    success: true,
    message: 'Profile updated successfully.',
    user: sanitizeUser(db.users[userIdx])
  });
};

export const changePassword = (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
  }

  const db = getDb();
  const userIdx = db.users.findIndex(u => u._id === req.user!._id);
  const user = db.users[userIdx];

  if (user.password && !bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ success: false, message: 'Current password does not match.' });
  }

  const salt = bcrypt.genSaltSync(10);
  db.users[userIdx].password = bcrypt.hashSync(newPassword, salt);
  saveDb(db);

  return res.json({
    success: true,
    message: 'Password changed successfully.'
  });
};
