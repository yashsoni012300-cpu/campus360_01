import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, User } from '../db.js';
import { generateToken, authenticateToken, AuthRequest, sanitizeUser } from '../auth.js';

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'student', enrollmentNo, department = 'Computer Engineering', semester = 6 } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ success: false, message: 'Please enter a valid full name (minimum 2 characters).' });
      return;
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    const existingUser = db.findUserByEmail(email.trim());
    if (existingUser) {
      res.status(409).json({ success: false, message: 'This email address is already registered. Please log in.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUserRole: 'student' | 'admin' = role === 'admin' ? 'admin' : 'student';
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newUser: User = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: newUserRole,
      enrollmentNo: enrollmentNo?.trim() || (newUserRole === 'student' ? `2101201${Math.floor(1000 + Math.random() * 9000)}` : undefined),
      department: department?.trim() || 'Computer Engineering',
      semester: newUserRole === 'student' ? Number(semester) || 6 : undefined,
      createdAt: new Date().toISOString()
    };

    db.addUser(newUser);

    // If student, seed default 5 subjects for them so attendance page is immediately populated!
    if (newUserRole === 'student') {
      const defaultSubjects = [
        { code: 'CE601', name: 'Design and Analysis of Algorithms', attended: 35, total: 42, faculty: 'Dr. R. K. Patel' },
        { code: 'CE602', name: 'Database Management Systems', attended: 38, total: 42, faculty: 'Prof. Kruti Sheth' },
        { code: 'CE603', name: 'Computer Networks', attended: 28, total: 40, faculty: 'Prof. M. B. Dave' }, // 70% shortage warning demo
        { code: 'CE604', name: 'Operating Systems & System Programming', attended: 36, total: 40, faculty: 'Prof. A. S. Shah' },
        { code: 'CE605', name: 'Theory of Computation & Automata', attended: 37, total: 42, faculty: 'Dr. V. N. Joshi' }
      ];

      defaultSubjects.forEach((sub, idx) => {
        db.addAttendance({
          id: `att_${Date.now()}_${idx}`,
          studentId: newUser.id,
          studentName: newUser.name,
          subjectCode: sub.code,
          subjectName: sub.name,
          attendedClasses: sub.attended,
          totalClasses: sub.total,
          facultyName: sub.faculty,
          semester: Number(semester) || 6,
          updatedAt: new Date().toISOString()
        });
      });
    }

    const token = generateToken(newUser);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const user = db.findUserByEmail(email.trim());
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User with this email not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
      return;
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: sanitizeUser(user)
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// Current user profile check
router.get('/me', authenticateToken, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const user = db.findUserById(req.user.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({
    success: true,
    user: sanitizeUser(user)
  });
});

// Logout
router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
