import { Router, Response } from 'express';
import { db, Book } from '../db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../auth.js';

const router = Router();

// Get books (Searchable and filterable)
router.get('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const { q, department, status } = req.query;
  let books = db.getBooks();

  if (q && typeof q === 'string') {
    const search = q.toLowerCase().trim();
    books = books.filter(b =>
      b.title.toLowerCase().includes(search) ||
      b.author.toLowerCase().includes(search) ||
      b.isbn.toLowerCase().includes(search) ||
      b.shelfLocation.toLowerCase().includes(search)
    );
  }

  if (department && typeof department === 'string' && department !== 'All') {
    books = books.filter(b => b.department.toLowerCase() === department.toLowerCase());
  }

  if (status && typeof status === 'string' && status !== 'All') {
    books = books.filter(b => b.status === status);
  }

  res.json({
    success: true,
    total: books.length,
    data: books
  });
});

// Admin: Add a new book
router.post('/', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  try {
    const { title, author, department, isbn, edition, shelfLocation, status = 'available' } = req.body;

    if (!title || !author || !department || !isbn) {
      res.status(400).json({ success: false, message: 'Title, author, department, and ISBN are required.' });
      return;
    }

    const newBook: Book = {
      id: `book_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      author: author.trim(),
      department: department.trim(),
      isbn: isbn.trim(),
      edition: edition?.trim() || 'Latest Edition',
      shelfLocation: shelfLocation?.trim() || 'General Rack',
      status: status === 'issued' ? 'issued' : 'available',
      addedAt: new Date().toISOString()
    };

    db.addBook(newBook);

    res.status(201).json({
      success: true,
      message: `Book "${newBook.title}" added to library catalog.`,
      data: newBook
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to add book.' });
  }
});

// Admin: Edit book
router.put('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { title, author, department, isbn, edition, shelfLocation, status, issuedTo } = req.body;

    const updates: Partial<Book> = {};
    if (title) updates.title = title.trim();
    if (author) updates.author = author.trim();
    if (department) updates.department = department.trim();
    if (isbn) updates.isbn = isbn.trim();
    if (edition) updates.edition = edition.trim();
    if (shelfLocation) updates.shelfLocation = shelfLocation.trim();
    if (status) updates.status = status;
    if (issuedTo !== undefined) updates.issuedTo = issuedTo;

    const updated = db.updateBook(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Book not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Book updated successfully.',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update book.' });
  }
});

// Admin: Toggle book availability (Available <-> Issued)
router.patch('/:id/toggle-status', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { studentId, studentName, issueDays = 30 } = req.body || {};

    const book = db.findBookById(id);
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found.' });
      return;
    }

    let updates: Partial<Book>;
    if (book.status === 'available') {
      const now = new Date();
      const dueDate = new Date();
      dueDate.setDate(now.getDate() + Number(issueDays || 30));

      updates = {
        status: 'issued',
        issuedTo: {
          studentId: studentId || 'usr_student_01',
          studentName: studentName || 'Enrolled Student',
          issueDate: now.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0]
        }
      };
    } else {
      // Mark as available
      updates = {
        status: 'available',
        issuedTo: undefined
      };
    }

    const updated = db.updateBook(id, updates);
    res.json({
      success: true,
      message: `Book is now ${updated?.status}.`,
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to toggle book availability status.' });
  }
});

// Admin: Delete book
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const deleted = db.deleteBook(id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Book not found.' });
    return;
  }
  res.json({ success: true, message: 'Book deleted from library catalog.' });
});

export default router;
