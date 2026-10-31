import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, AuthRequest } from '../auth.js';

const router = Router();

router.get('/overview', authenticateToken, (req: AuthRequest, res: Response): void => {
  const user = req.user!;
  const books = db.getBooks();
  const news = db.getNews();
  const complaints = db.getComplaints();
  const attendance = db.getAttendance();
  const users = db.getUsers();

  const totalBooks = books.length;
  const availableBooks = books.filter(b => b.status === 'available').length;
  const issuedBooks = totalBooks - availableBooks;

  if (user.role === 'admin') {
    const students = users.filter(u => u.role === 'student');

    let campusAttended = 0;
    let campusTotal = 0;
    attendance.forEach(a => {
      campusAttended += a.attendedClasses;
      campusTotal += a.totalClasses;
    });
    const campusAvgAttendance = campusTotal > 0 ? Math.round((campusAttended / campusTotal) * 100) : 0;

    const openComplaints = complaints.filter(c => c.status === 'Open').length;
    const inProgressComplaints = complaints.filter(c => c.status === 'In Progress').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;

    res.json({
      success: true,
      role: 'admin',
      data: {
        totalStudents: students.length,
        campusAvgAttendance,
        totalBooks,
        availableBooks,
        issuedBooks,
        totalNews: news.length,
        openComplaints,
        inProgressComplaints,
        resolvedComplaints,
        totalComplaints: complaints.length
      }
    });
  } else {
    // Student overview
    const myAttendance = attendance.filter(a => a.studentId === user.id);
    let myAttended = 0;
    let myTotal = 0;
    const shortageSubjects: string[] = [];

    myAttendance.forEach(a => {
      myAttended += a.attendedClasses;
      myTotal += a.totalClasses;
      const pct = a.totalClasses > 0 ? (a.attendedClasses / a.totalClasses) * 100 : 0;
      if (pct < 75 && a.totalClasses > 0) {
        shortageSubjects.push(a.subjectName);
      }
    });

    const averageAttendance = myTotal > 0 ? Math.round((myAttended / myTotal) * 100) : 0;
    const myComplaints = complaints.filter(c => c.studentId === user.id);
    const myActiveComplaints = myComplaints.filter(c => c.status !== 'Resolved').length;
    const myBorrowedBooks = books.filter(b => b.issuedTo?.studentId === user.id);

    res.json({
      success: true,
      role: 'student',
      data: {
        averageAttendance,
        totalSubjects: myAttendance.length,
        hasShortageWarning: averageAttendance < 75 && myTotal > 0,
        shortageSubjects,
        availableBooks,
        totalBooks,
        latestNewsCount: news.length,
        myComplaintsCount: myComplaints.length,
        myActiveComplaints,
        myBorrowedBooksCount: myBorrowedBooks.length
      }
    });
  }
});

export default router;
