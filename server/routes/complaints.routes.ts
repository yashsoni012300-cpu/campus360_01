import { Router, Response } from 'express';
import { db, Complaint } from '../db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../auth.js';

const router = Router();

// Get complaints
// Student gets their own complaints; Admin gets all complaints
router.get('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const user = req.user!;
  const { status, category } = req.query;

  let complaints: Complaint[] = [];
  if (user.role === 'admin') {
    complaints = db.getComplaints();
  } else {
    complaints = db.getComplaintsByStudentId(user.id);
  }

  if (status && typeof status === 'string' && status !== 'All') {
    complaints = complaints.filter(c => c.status === status);
  }

  if (category && typeof category === 'string' && category !== 'All') {
    complaints = complaints.filter(c => c.category === category);
  }

  res.json({
    success: true,
    total: complaints.length,
    data: complaints
  });
});

// Student/User submits a complaint or feedback
router.post('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { category, subject, description } = req.body;

    if (!category || !subject || !description) {
      res.status(400).json({ success: false, message: 'Category, subject, and description are required.' });
      return;
    }

    if (subject.trim().length < 5) {
      res.status(400).json({ success: false, message: 'Subject must be at least 5 characters long.' });
      return;
    }

    if (description.trim().length < 10) {
      res.status(400).json({ success: false, message: 'Please provide a detailed description (minimum 10 characters).' });
      return;
    }

    const newComplaint: Complaint = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
      enrollmentNo: user.enrollmentNo,
      category,
      subject: subject.trim(),
      description: description.trim(),
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.addComplaint(newComplaint);

    res.status(201).json({
      success: true,
      message: 'Grievance / Feedback ticket registered successfully. You can track its progress here.',
      data: newComplaint
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to submit complaint.' });
  }
});

// Admin: Update complaint status and remark
router.patch('/:id/status', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { status, adminRemark } = req.body;

    if (!status || !['Open', 'In Progress', 'Resolved'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be Open, In Progress, or Resolved.' });
      return;
    }

    const updates: Partial<Complaint> = {
      status
    };

    if (adminRemark !== undefined) {
      updates.adminRemark = adminRemark.trim();
    }

    if (status === 'Resolved') {
      updates.resolvedAt = new Date().toISOString();
    }

    const updated = db.updateComplaint(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Complaint ticket not found.' });
      return;
    }

    res.json({
      success: true,
      message: `Grievance ticket marked as ${status}.`,
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update complaint status.' });
  }
});

// Delete complaint (Admin or ticket owner)
router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  const user = req.user!;
  const { id } = req.params;

  const complaint = db.getComplaints().find(c => c.id === id);
  if (!complaint) {
    res.status(404).json({ success: false, message: 'Complaint not found.' });
    return;
  }

  // Only admin or the creator can delete
  if (user.role !== 'admin' && complaint.studentId !== user.id) {
    res.status(403).json({ success: false, message: 'Unauthorized to delete this ticket.' });
    return;
  }

  db.deleteComplaint(id);
  res.json({ success: true, message: 'Ticket deleted successfully.' });
});

export default router;
