import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireAdmin, AuthRequest, sanitizeUser } from '../auth.js';

const router = Router();

// Admin: Get all registered students with aggregated statistics
router.get('/', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  const users = db.getUsers().filter(u => u.role === 'student');
  const attendanceRecords = db.getAttendance();
  const complaints = db.getComplaints();
  const books = db.getBooks();

  const studentsWithStats = users.map(user => {
    const studentAttendance = attendanceRecords.filter(a => a.studentId === user.id);
    let totalAttended = 0;
    let totalClasses = 0;

    studentAttendance.forEach(a => {
      totalAttended += a.attendedClasses;
      totalClasses += a.totalClasses;
    });

    const averageAttendance = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
    const studentComplaints = complaints.filter(c => c.studentId === user.id);
    const issuedBooks = books.filter(b => b.issuedTo?.studentId === user.id);

    return {
      ...sanitizeUser(user),
      subjectsCount: studentAttendance.length,
      averageAttendance,
      hasShortage: averageAttendance < 75 && totalClasses > 0,
      complaintsCount: studentComplaints.length,
      issuedBooksCount: issuedBooks.length
    };
  });

  res.json({
    success: true,
    total: studentsWithStats.length,
    data: studentsWithStats
  });
});

// Admin: Delete a student
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const user = db.findUserById(id);

  if (!user) {
    res.status(404).json({ success: false, message: 'Student not found.' });
    return;
  }

  if (user.role === 'admin') {
    res.status(400).json({ success: false, message: 'Cannot delete an administrator account via this route.' });
    return;
  }

  db.deleteUser(id);
  res.json({ success: true, message: `Student account for ${user.name} removed successfully.` });
});

export default router;
