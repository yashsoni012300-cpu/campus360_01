import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  BookmarkCheck,
  MapPin,
  Barcode,
  Layers,
  X,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { Book } from '../types/index.ts';

export const LibraryPage: React.FC = () => {
  const { user, isAdmin, authFetch } = useAuth();
  const { success, error } = useToast();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    department: 'Computer Engineering',
    isbn: '',
    edition: '1st Edition',
    shelfLocation: 'Rack A-01, Shelf 1',
    status: 'available' as 'available' | 'issued'
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (departmentFilter !== 'All') params.append('department', departmentFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const res = await authFetch(`/api/books?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setBooks(data.data);
      }
    } catch (err) {
      error('Failed to load library catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [departmentFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks();
  };

  const handleOpenAdd = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      department: 'Computer Engineering',
      isbn: `978-013${Math.floor(100000 + Math.random() * 900000)}`,
      edition: 'Latest Edition',
      shelfLocation: 'Rack B-03, Shelf 2',
      status: 'available'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      department: book.department,
      isbn: book.isbn,
      edition: book.edition,
      shelfLocation: book.shelfLocation,
      status: book.status
    });
    setIsModalOpen(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBook) {
        const res = await authFetch(`/api/books/${editingBook.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          success('Book details updated.');
          setIsModalOpen(false);
          fetchBooks();
        } else {
          error(data.message);
        }
      } else {
        const res = await authFetch('/api/books', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          success('Book added to library catalog.');
          setIsModalOpen(false);
          fetchBooks();
        } else {
          error(data.message);
        }
      }
    } catch (err) {
      error('Failed to save book.');
    }
  };

  const handleToggleStatus = async (book: Book) => {
    try {
      const res = await authFetch(`/api/books/${book.id}/toggle-status`, {
        method: 'PATCH',
        body: JSON.stringify({
          studentName: 'Yash Soni (Student)',
          studentId: 'usr_student_01'
        })
      });
      const data = await res.json();
      if (data.success) {
        success(data.message);
        fetchBooks();
      } else {
        error(data.message);
      }
    } catch (err) {
      error('Failed to toggle book availability.');
    }
  };

  const handleDeleteBook = async (book: Book) => {
    if (!confirm(`Remove "${book.title}" from library inventory?`)) return;
    try {
      const res = await authFetch(`/api/books/${book.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success('Book removed from library.');
        fetchBooks();
      } else {
        error(data.message);
      }
    } catch (err) {
      error('Failed to delete book.');
    }
  };

  const availableCount = books.filter(b => b.status === 'available').length;
  const issuedCount = books.length - availableCount;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Central Learning Resource Center &bull; Silver Oak Campus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Smart Library Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Search physical textbooks, reference materials, rack locations, and real-time circulation availability.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 transition self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Book
          </button>
        )}
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Volumes</span>
          <p className="text-2xl font-extrabold text-white mt-1">{books.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-emerald-400 uppercase font-semibold">Available on Shelf</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">{availableCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-amber-400 uppercase font-semibold">Currently Issued</span>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">{issuedCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-indigo-400 uppercase font-semibold">Library Timing</span>
          <p className="text-sm font-bold text-white mt-1">8:00 AM - 8:00 PM</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search books by title, author, ISBN, or rack..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-24 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Departments</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="AI & Data Science">AI & Data Science</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="available">Available Only</option>
            <option value="issued">Issued Only</option>
          </select>
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Searching library resources...</div>
      ) : books.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-300 font-medium">No books matched your criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setDepartmentFilter('All');
              setStatusFilter('All');
            }}
            className="text-xs text-indigo-400 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {books.map(book => {
            const isAvailable = book.status === 'available';

            return (
              <div
                key={book.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Top Bar with Department & Status badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      {book.department}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isAvailable
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      {isAvailable ? 'Available' : 'Issued'}
                    </span>
                  </div>

                  {/* Title & Author */}
                  <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 mb-1">{book.title}</h3>
                  <p className="text-xs text-slate-400 mb-3">{book.author}</p>

                  {/* Metadata Chips */}
                  <div className="space-y-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{book.shelfLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Barcode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono text-slate-400">ISBN: {book.isbn}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{book.edition}</span>
                    </div>
                  </div>

                  {/* Issued info if issued */}
                  {!isAvailable && book.issuedTo && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-amber-300">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Issued To
                        </span>
                        <span>Due: {book.issuedTo.dueDate}</span>
                      </div>
                      <p className="text-[11px] text-amber-200 truncate">{book.issuedTo.studentName}</p>
                    </div>
                  )}
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleStatus(book)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                        isAvailable
                          ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                      }`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      Mark {isAvailable ? 'Issued' : 'Available'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(book)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Edit Book"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Book"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Book Modal */}
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
              {editingBook ? 'Edit Book Details' : 'Add Book to Library Catalog'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Faculty / Librarian Portal &bull; Central Learning Resource Center
            </p>

            <form onSubmit={handleSaveBook} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to Algorithms"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Author(s) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thomas H. Cormen, Charles E. Leiserson"
                  value={formData.author}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Edition</label>
                  <input
                    type="text"
                    placeholder="e.g. 4th Edition"
                    value={formData.edition}
                    onChange={e => setFormData({ ...formData, edition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">ISBN *</label>
                  <input
                    type="text"
                    required
                    placeholder="978-0262033848"
                    value={formData.isbn}
                    onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Shelf Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="Rack B-04, Shelf 2"
                    value={formData.shelfLocation}
                    onChange={e => setFormData({ ...formData, shelfLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
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
                  {editingBook ? 'Save Changes' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
