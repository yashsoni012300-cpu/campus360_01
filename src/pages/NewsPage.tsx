import React, { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  Pin,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Tag,
  Building,
  Sparkles,
  X,
  Clock,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { NewsItem } from '../types/index.ts';

export const NewsPage: React.FC = () => {
  const { user, isAdmin, authFetch } = useAuth();
  const { success, error } = useToast();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'Notice' as 'Notice' | 'Event',
    category: 'Academic' as 'Academic' | 'Examination' | 'Cultural' | 'Sports' | 'Placement' | 'General',
    department: 'Computer Engineering',
    eventDate: '',
    pinned: false
  });

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== 'All') params.append('type', typeFilter);
      if (categoryFilter !== 'All') params.append('category', categoryFilter);

      const res = await authFetch(`/api/news?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setNews(data.data);
      }
    } catch (err) {
      error('Failed to load campus notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [typeFilter, categoryFilter]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      type: 'Notice',
      category: 'Academic',
      department: 'Computer Engineering',
      eventDate: '',
      pinned: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type,
      category: item.category,
      department: item.department,
      eventDate: item.eventDate || '',
      pinned: item.pinned
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      error('Title and content are required.');
      return;
    }

    try {
      if (editingItem) {
        const res = await authFetch(`/api/news/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          success('Post updated.');
          setIsModalOpen(false);
          fetchNews();
        } else {
          error(data.message);
        }
      } else {
        const res = await authFetch('/api/news', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          success('Notice / Event published successfully.');
          setIsModalOpen(false);
          fetchNews();
        } else {
          error(data.message);
        }
      }
    } catch (err) {
      error('Failed to save announcement.');
    }
  };

  const handleDelete = async (item: NewsItem) => {
    if (!confirm(`Delete announcement "${item.title}"?`)) return;
    try {
      const res = await authFetch(`/api/news/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success('Announcement removed.');
        fetchNews();
      } else {
        error(data.message);
      }
    } catch (err) {
      error('Failed to delete announcement.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <Bell className="w-4 h-4" />
            <span>Digital Notice Board &bull; University Circulars</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            News, Events & Circulars
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Official announcements, examination schedules, hackathons, and PBL project exhibition updates.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 transition self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Publish Notice / Event
          </button>
        )}
      </div>

      {/* Filter Chips Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          {['All', 'Notice', 'Event'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                typeFilter === type
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {type === 'All' ? 'All Types' : `${type}s`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Examination">Examination</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Placement">Placement</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading campus announcements...</div>
      ) : news.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
          <Bell className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-300 font-medium">No announcements match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map(item => {
            const isNotice = item.type === 'Notice';

            return (
              <div
                key={item.id}
                className={`p-6 rounded-2xl bg-slate-900/80 border transition-all duration-300 shadow-lg ${
                  item.pinned
                    ? 'border-indigo-500/50 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 shadow-indigo-950/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.pinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Pin className="w-3 h-3 fill-amber-300" /> Pinned
                      </span>
                    )}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                        isNotice
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      &bull; {item.department}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {item.eventDate && (
                      <span className="flex items-center gap-1 text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        <Calendar className="w-3.5 h-3.5" /> Event Date: {item.eventDate}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString()}
                    </span>

                    {isAdmin && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Edit notice"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                          title="Delete notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Published by: <strong className="text-slate-400">{item.publishedBy}</strong></span>
                  <span className="text-indigo-400/80">Silver Oak University Circular</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Publish / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {editingItem ? 'Edit Circular / Event' : 'Publish Notice or Event'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Faculty & Department Administration Broadcaster
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PBL-1 Project Exhibition Evaluation Schedule"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Post Type *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Notice">Notice</option>
                    <option value="Event">Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Examination">Examination</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Placement">Placement</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="All Departments">All Departments</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Silver Oak University">Silver Oak University</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Event Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Circular Content *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detailed circular instructions, venue, prerequisites..."
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formData.pinned}
                  onChange={e => setFormData({ ...formData, pinned: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-800"
                />
                <label htmlFor="pinCheck" className="text-xs text-slate-300 font-medium">
                  Pin this circular to top of campus notice board
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
                >
                  {editingItem ? 'Save Changes' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
