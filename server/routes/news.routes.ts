import { Router, Response } from 'express';
import { db, NewsItem } from '../db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../auth.js';

const router = Router();

// Get all news and events
router.get('/', authenticateToken, (req: AuthRequest, res: Response): void => {
  const { type, category } = req.query;
  let items = db.getNews();

  if (type && typeof type === 'string' && type !== 'All') {
    items = items.filter(n => n.type.toLowerCase() === type.toLowerCase());
  }

  if (category && typeof category === 'string' && category !== 'All') {
    items = items.filter(n => n.category.toLowerCase() === category.toLowerCase());
  }

  res.json({
    success: true,
    total: items.length,
    data: items
  });
});

// Admin: Create news or event item
router.post('/', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  try {
    const { title, content, type = 'Notice', category = 'Academic', department = 'All Departments', eventDate, pinned = false } = req.body;

    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required.' });
      return;
    }

    const newItem: NewsItem = {
      id: `news_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      content: content.trim(),
      type: type === 'Event' ? 'Event' : 'Notice',
      category: category || 'Academic',
      department: department.trim(),
      eventDate: eventDate ? eventDate.trim() : undefined,
      pinned: Boolean(pinned),
      publishedBy: req.user?.name || 'Administrator',
      createdAt: new Date().toISOString()
    };

    db.addNews(newItem);

    res.status(201).json({
      success: true,
      message: `${newItem.type} posted successfully!`,
      data: newItem
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create news item.' });
  }
});

// Admin: Edit news or event item
router.put('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { title, content, type, category, department, eventDate, pinned } = req.body;

    const updates: Partial<NewsItem> = {};
    if (title) updates.title = title.trim();
    if (content) updates.content = content.trim();
    if (type) updates.type = type;
    if (category) updates.category = category;
    if (department) updates.department = department.trim();
    if (eventDate !== undefined) updates.eventDate = eventDate;
    if (pinned !== undefined) updates.pinned = Boolean(pinned);

    const updated = db.updateNews(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: 'News item not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Post updated successfully.',
      data: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update news item.' });
  }
});

// Admin: Delete news or event item
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const deleted = db.deleteNews(id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'News item not found.' });
    return;
  }
  res.json({ success: true, message: 'Post removed successfully.' });
});

export default router;
