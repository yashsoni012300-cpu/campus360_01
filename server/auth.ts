import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, User } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'campus360_super_secret_sou_2026_key';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  enrollmentNo?: string;
  department: string;
  semester?: number;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateToken(user: User): string {
  const payload: AuthenticatedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    enrollmentNo: user.enrollmentNo,
    department: user.department,
    semester: user.semester
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  let token: string | undefined;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // 2. Check cookies
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    // Verify user still exists in DB
    const freshUser = db.findUserById(decoded.id);
    if (!freshUser) {
      res.status(401).json({ success: false, message: 'User account no longer exists.' });
      return;
    }
    req.user = {
      id: freshUser.id,
      name: freshUser.name,
      email: freshUser.email,
      role: freshUser.role,
      enrollmentNo: freshUser.enrollmentNo,
      department: freshUser.department,
      semester: freshUser.semester
    };
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Administrative privileges are required for this action.'
    });
    return;
  }
  next();
}

export function sanitizeUser(user: User): Omit<User, 'passwordHash'> {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
