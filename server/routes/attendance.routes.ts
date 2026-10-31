import { Router, Response } from 'express';
import { db, AttendanceRecord } from '../db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../auth.js';

const router = Router();

// Get attendance
// Student gets their own; Admin gets all or filtered by ?studentId=...
router.get('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const user = req.user!;
  const targetStudentId = req.query.studentId as string | undefined;

  if (user.role === 'student') {
    const records = db.getAttendanceByStudentId(user.id);
    res.json({ success: true, data: records });
    return;
  }

  // Admin
  if (targetStudentId) {
    const records = db.getAttendanceByStudentId(targetStudentId);
    res.json({ success: true, data: records });
  } else {
    const records = db.getAttendance();
    res.json({ success: true, data: records });
  }
});

// Admin: Add attendance record for a student
router.post('/', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  try {
    const { studentId, subjectCode, subjectName, attendedClasses, totalClasses, facultyName, semester } = req.body;

    if (!studentId || !subjectCode || !subjectName || attendedClasses === undefined || !totalClasses) {
      res.status(400).json({ success: false, message: 'Missing required attendance fields.' });
      return;
    }

    const student = db.findUserById(studentId);
    if (!student) {
      res.status(404).json({ success: false, message: 'Target student not found.' });
      return;
    }

    const attended = Number(attendedClasses);
    const total = Number(totalClasses);

    if (isNaN(attended) || isNaN(total) || total <= 0 || attended < 0 || attended > total) {
      res.status(400).json({
        success: false,
        message: 'Invalid class counts. Attended must be between 0 and Total classes.'
      });
      return;
    }

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId: student.id,
      studentName: student.name,
      subjectCode: subjectCode.trim().toUpperCase(),
      subjectName: subjectName.trim(),
      attendedClasses: attended,
      totalClasses: total,
      facultyName: facultyName?.trim() || 'Department Faculty',
      semester: Number(semester) || student.semester || 6,
      updatedAt: new Date().toISOString()
    };

    db.addAttendance(newRecord);

    res.status(201).json({
      success: true,
      message: `Attendance added for ${student.name} in ${newRecord.subjectName}.`,
      data: newRecord
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to record attendance.' });
  }
});

// Admin: Update attendance record
router.put('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { subjectCode, subjectName, attendedClasses, totalClasses, facultyName, semester } = req.body;

    const updates: Partial<AttendanceRecord> = {};
    if (subjectCode) updates.subjectCode = subjectCode.trim().toUpperCase();
    if (subjectName) updates.subjectName = subjectName.trim();
    if (facultyName) updates.facultyName = facultyName.trim();
    if (semester !== undefined) updates.semester = Number(semester);

    if (attendedClasses !== undefined || totalClasses !== undefined) {
      const attended = Number(attendedClasses);
      const total = Number(totalClasses);
      if (isNaN(attended) || isNaN(total) || total <= 0 || attended < 0 || attended > total) {
        res.status(400).json({
          success: false,
          message: 'Attended classes cannot exceed total classes and must be non-negative numbers.'
        });
        return;
      }
      updates.attendedClasses = attended;
      updates.totalClasses = total;
    }

    const updated = db.updateAttendance(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Attendance record not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Attendance record updated successfully.',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update attendance record.' });
  }
});

// Admin: Delete attendance record
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const deleted = db.deleteAttendance(id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Attendance record not found.' });
    return;
  }
  res.json({ success: true, message: 'Attendance record deleted successfully.' });
});

export default router;
