import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/index.js';
import { IUser } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect-super-secure-jwt-secret-key-2025';

export interface AuthRequest extends Request {
  user?: IUser;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const db = getDb();
    const user = db.users.find(u => u._id === decoded.id && u.isActive);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or user deactivated. Please log in again.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token expired or invalid. Please re-authenticate.'
    });
  }
}

export function requireRole(...allowedRoles: Array<'student' | 'faculty' | 'admin'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to ${allowedRoles.join(', ')} only.`
      });
    }

    next();
  };
}
