import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'admin';
  enrollmentNo?: string;
  department: string;
  semester?: number;
  phone?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  subjectCode: string;
  subjectName: string;
  attendedClasses: number;
  totalClasses: number;
  facultyName: string;
  semester: number;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  department: string;
  isbn: string;
  edition: string;
  shelfLocation: string;
  status: 'available' | 'issued';
  issuedTo?: {
    studentId: string;
    studentName: string;
    issueDate: string;
    dueDate: string;
  };
  addedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: 'Notice' | 'Event';
  category: 'Academic' | 'Examination' | 'Cultural' | 'Sports' | 'Placement' | 'General';
  department: string;
  eventDate?: string;
  pinned: boolean;
  publishedBy: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrollmentNo?: string;
  category: 'Academic' | 'Infrastructure' | 'Library' | 'Hostel' | 'Canteen' | 'Examination' | 'IT Support' | 'Other';
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  adminRemark?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: User[];
  attendance: AttendanceRecord[];
  books: Book[];
  news: NewsItem[];
  complaints: Complaint[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class DatabaseEngine {
  private data: DatabaseSchema = {
    users: [],
    attendance: [],
    books: [],
    news: [],
    complaints: []
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } catch (err) {
        console.error('Error reading DB file, re-initializing seed data', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  private persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const studentPassHash = bcrypt.hashSync('Student@123', salt);
    const adminPassHash = bcrypt.hashSync('Admin@123', salt);
    const now = new Date().toISOString();

    const studentUser: User = {
      id: 'usr_student_01',
      name: 'Yash Soni',
      email: 'student@campus360.com',
      passwordHash: studentPassHash,
      role: 'student',
      enrollmentNo: '21012011040',
      department: 'Computer Engineering',
      semester: 6,
      phone: '+91 98765 43210',
      createdAt: now
    };

    const studentUser2: User = {
      id: 'usr_student_02',
      name: 'Hitiksha Anjani',
      email: 'hitiksha@campus360.com',
      passwordHash: studentPassHash,
      role: 'student',
      enrollmentNo: '21012011041',
      department: 'Computer Engineering',
      semester: 6,
      phone: '+91 98765 43211',
      createdAt: now
    };

    const adminUser: User = {
      id: 'usr_admin_01',
      name: 'Prof. Kruti Sheth (Admin)',
      email: 'admin@campus360.com',
      passwordHash: adminPassHash,
      role: 'admin',
      department: 'Computer Engineering',
      phone: '+91 98250 12345',
      createdAt: now
    };

    const sampleAttendance: AttendanceRecord[] = [
      {
        id: 'att_01',
        studentId: 'usr_student_01',
        studentName: 'Yash Soni',
        subjectCode: 'CE601',
        subjectName: 'Design and Analysis of Algorithms',
        attendedClasses: 38,
        totalClasses: 45,
        facultyName: 'Dr. R. K. Patel',
        semester: 6,
        updatedAt: now
      },
      {
        id: 'att_02',
        studentId: 'usr_student_01',
        studentName: 'Yash Soni',
        subjectCode: 'CE602',
        subjectName: 'Database Management Systems',
        attendedClasses: 42,
        totalClasses: 48,
        facultyName: 'Prof. Kruti Sheth',
        semester: 6,
        updatedAt: now
      },
      {
        id: 'att_03',
        studentId: 'usr_student_01',
        studentName: 'Yash Soni',
        subjectCode: 'CE603',
        subjectName: 'Computer Networks',
        attendedClasses: 30,
        totalClasses: 44, // 68.18% -> Shortage Warning (<75%)
        facultyName: 'Prof. M. B. Dave',
        semester: 6,
        updatedAt: now
      },
      {
        id: 'att_04',
        studentId: 'usr_student_01',
        studentName: 'Yash Soni',
        subjectCode: 'CE604',
        subjectName: 'Operating Systems & System Programming',
        attendedClasses: 36,
        totalClasses: 42,
        facultyName: 'Prof. A. S. Shah',
        semester: 6,
        updatedAt: now
      },
      {
        id: 'att_05',
        studentId: 'usr_student_01',
        studentName: 'Yash Soni',
        subjectCode: 'CE605',
        subjectName: 'Theory of Computation & Automata',
        attendedClasses: 39,
        totalClasses: 46,
        facultyName: 'Dr. V. N. Joshi',
        semester: 6,
        updatedAt: now
      },
      // Student 2 attendance
      {
        id: 'att_06',
        studentId: 'usr_student_02',
        studentName: 'Hitiksha Anjani',
        subjectCode: 'CE601',
        subjectName: 'Design and Analysis of Algorithms',
        attendedClasses: 41,
        totalClasses: 45,
        facultyName: 'Dr. R. K. Patel',
        semester: 6,
        updatedAt: now
      },
      {
        id: 'att_07',
        studentId: 'usr_student_02',
        studentName: 'Hitiksha Anjani',
        subjectCode: 'CE603',
        subjectName: 'Computer Networks',
        attendedClasses: 40,
        totalClasses: 44,
        facultyName: 'Prof. M. B. Dave',
        semester: 6,
        updatedAt: now
      }
    ];

    const sampleBooks: Book[] = [
      {
        id: 'book_01',
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen, Charles E. Leiserson',
        department: 'Computer Engineering',
        isbn: '978-0262033848',
        edition: '3rd Edition',
        shelfLocation: 'Rack B-04, Shelf 2',
        status: 'available',
        addedAt: now
      },
      {
        id: 'book_02',
        title: 'Database System Concepts',
        author: 'Abraham Silberschatz, Henry F. Korth',
        department: 'Computer Engineering',
        isbn: '978-0078022159',
        edition: '7th Edition',
        shelfLocation: 'Rack B-02, Shelf 1',
        status: 'issued',
        issuedTo: {
          studentId: 'usr_student_01',
          studentName: 'Yash Soni',
          issueDate: '2026-10-15',
          dueDate: '2026-11-15'
        },
        addedAt: now
      },
      {
        id: 'book_03',
        title: 'Computer Networks: A Systems Approach',
        author: 'Larry L. Peterson, Bruce S. Davie',
        department: 'Computer Engineering',
        isbn: '978-0123850591',
        edition: '5th Edition',
        shelfLocation: 'Rack C-01, Shelf 3',
        status: 'available',
        addedAt: now
      },
      {
        id: 'book_04',
        title: 'Operating System Concepts (Dinosaur Book)',
        author: 'Abraham Silberschatz, Peter B. Galvin',
        department: 'Computer Engineering',
        isbn: '978-1119800361',
        edition: '10th Edition',
        shelfLocation: 'Rack B-05, Shelf 4',
        status: 'available',
        addedAt: now
      },
      {
        id: 'book_05',
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell, Peter Norvig',
        department: 'AI & Data Science',
        isbn: '978-0134610993',
        edition: '4th Edition',
        shelfLocation: 'Rack A-03, Shelf 2',
        status: 'available',
        addedAt: now
      },
      {
        id: 'book_06',
        title: 'Cloud Computing: Principles and Paradigms',
        author: 'Rajkumar Buyya, James Broberg',
        department: 'Information Technology',
        isbn: '978-0470887998',
        edition: '2nd Edition',
        shelfLocation: 'Rack D-02, Shelf 1',
        status: 'issued',
        issuedTo: {
          studentId: 'usr_student_02',
          studentName: 'Hitiksha Anjani',
          issueDate: '2026-10-20',
          dueDate: '2026-11-20'
        },
        addedAt: now
      },
      {
        id: 'book_07',
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        department: 'Computer Engineering',
        isbn: '978-0132350884',
        edition: '1st Edition',
        shelfLocation: 'Rack A-01, Shelf 5',
        status: 'available',
        addedAt: now
      },
      {
        id: 'book_08',
        title: 'Machine Learning: The Art and Science of Algorithms',
        author: 'Peter Flach',
        department: 'AI & Data Science',
        isbn: '978-1107422223',
        edition: '1st Edition',
        shelfLocation: 'Rack A-04, Shelf 3',
        status: 'available',
        addedAt: now
      }
    ];

    const sampleNews: NewsItem[] = [
      {
        id: 'news_01',
        title: 'PBL-1 Project Exhibition 2026 Announced for Computer Engineering',
        content: 'Department of Computer Engineering at Silver Oak University invites all 6th-semester students to showcase their Project-Based Learning (PBL-1) prototypes. Campus360 and Smart Campus automation systems will be evaluated by industry delegates.',
        type: 'Event',
        category: 'Academic',
        department: 'Computer Engineering',
        eventDate: '2026-11-12',
        pinned: true,
        publishedBy: 'Department Coordinator',
        createdAt: now
      },
      {
        id: 'news_02',
        title: 'Mid-Semester Theory & Practical Examination Schedule Published',
        content: 'All undergraduate engineering students are hereby notified that the winter mid-semester examinations will commence from November 20th. Verify your subject-wise minimum 75% attendance threshold on Campus360 before hall-ticket issuance.',
        type: 'Notice',
        category: 'Examination',
        department: 'All Departments',
        eventDate: '2026-11-20',
        pinned: true,
        publishedBy: 'Controller of Examination',
        createdAt: now
      },
      {
        id: 'news_03',
        title: 'Smart Campus Hackathon under Viksit Bharat @ 2047 Initiative',
        content: 'Participate in the 36-hour hackathon focused on sustainable campus operations, AI-driven resource utilization, paperless workflows, and student digital well-being. Cash prizes worth INR 1,50,000 to be won.',
        type: 'Event',
        category: 'Cultural',
        department: 'Silver Oak University',
        eventDate: '2026-12-05',
        pinned: false,
        publishedBy: 'Innovation Council',
        createdAt: now
      }
    ];

    const sampleComplaints: Complaint[] = [
      {
        id: 'comp_01',
        studentId: 'usr_student_01',
        studentName: 'Yash Soni',
        studentEmail: 'student@campus360.com',
        enrollmentNo: '21012011040',
        category: 'Library',
        subject: 'Wi-Fi connectivity drop in Central Library 2nd floor reading hall',
        description: 'The Wi-Fi access point near Rack B-04 disconnects frequently during peak study hours between 2 PM and 5 PM, interrupting digital research access.',
        status: 'In Progress',
        adminRemark: 'IT hardware team has dispatched a technician to upgrade the Wi-Fi 6 access point on the 2nd floor.',
        createdAt: '2026-10-24T10:30:00.000Z',
        updatedAt: '2026-10-25T14:10:00.000Z'
      },
      {
        id: 'comp_02',
        studentId: 'usr_student_01',
        studentName: 'Yash Soni',
        studentEmail: 'student@campus360.com',
        enrollmentNo: '21012011040',
        category: 'Academic',
        subject: 'Attendance reconciliation for Computer Networks Lab batch B2',
        description: 'Attended session on October 18th was mistakenly marked absent in the physical register before being synchronized to Campus360 portal.',
        status: 'Resolved',
        adminRemark: 'Verified with Prof. Dave; attendance record has been updated to present.',
        resolvedAt: '2026-10-28T16:00:00.000Z',
        createdAt: '2026-10-19T09:15:00.000Z',
        updatedAt: '2026-10-28T16:00:00.000Z'
      },
      {
        id: 'comp_03',
        studentId: 'usr_student_02',
        studentName: 'Hitiksha Anjani',
        studentEmail: 'hitiksha@campus360.com',
        enrollmentNo: '21012011041',
        category: 'Infrastructure',
        subject: 'Projector display resolution flickering in Seminar Hall 3',
        description: 'During PBL presentations, the HDMI connector on podium 2 experiences color distortion and flickering.',
        status: 'Open',
        createdAt: '2026-10-29T11:45:00.000Z',
        updatedAt: '2026-10-29T11:45:00.000Z'
      }
    ];

    this.data = {
      users: [studentUser, studentUser2, adminUser],
      attendance: sampleAttendance,
      books: sampleBooks,
      news: sampleNews,
      complaints: sampleComplaints
    };

    this.persist();
  }

  // --- Collection Accessors ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  public deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    // Also remove user's attendance and complaints
    this.data.attendance = this.data.attendance.filter(a => a.studentId !== id);
    this.persist();
    return this.data.users.length < initialLen;
  }

  // Attendance
  public getAttendance(): AttendanceRecord[] {
    return this.data.attendance;
  }

  public getAttendanceByStudentId(studentId: string): AttendanceRecord[] {
    return this.data.attendance.filter(a => a.studentId === studentId);
  }

  public addAttendance(record: AttendanceRecord): AttendanceRecord {
    this.data.attendance.push(record);
    this.persist();
    return record;
  }

  public updateAttendance(id: string, updates: Partial<AttendanceRecord>): AttendanceRecord | null {
    const index = this.data.attendance.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.data.attendance[index] = {
      ...this.data.attendance[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.attendance[index];
  }

  public deleteAttendance(id: string): boolean {
    const initialLen = this.data.attendance.length;
    this.data.attendance = this.data.attendance.filter(a => a.id !== id);
    this.persist();
    return this.data.attendance.length < initialLen;
  }

  // Books
  public getBooks(): Book[] {
    return this.data.books;
  }

  public findBookById(id: string): Book | undefined {
    return this.data.books.find(b => b.id === id);
  }

  public addBook(book: Book): Book {
    this.data.books.push(book);
    this.persist();
    return book;
  }

  public updateBook(id: string, updates: Partial<Book>): Book | null {
    const index = this.data.books.findIndex(b => b.id === id);
    if (index === -1) return null;
    this.data.books[index] = {
      ...this.data.books[index],
      ...updates
    };
    this.persist();
    return this.data.books[index];
  }

  public deleteBook(id: string): boolean {
    const initialLen = this.data.books.length;
    this.data.books = this.data.books.filter(b => b.id !== id);
    this.persist();
    return this.data.books.length < initialLen;
  }

  // News & Events
  public getNews(): NewsItem[] {
    return [...this.data.news].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public addNews(item: NewsItem): NewsItem {
    this.data.news.push(item);
    this.persist();
    return item;
  }

  public updateNews(id: string, updates: Partial<NewsItem>): NewsItem | null {
    const index = this.data.news.findIndex(n => n.id === id);
    if (index === -1) return null;
    this.data.news[index] = {
      ...this.data.news[index],
      ...updates
    };
    this.persist();
    return this.data.news[index];
  }

  public deleteNews(id: string): boolean {
    const initialLen = this.data.news.length;
    this.data.news = this.data.news.filter(n => n.id !== id);
    this.persist();
    return this.data.news.length < initialLen;
  }

  // Complaints
  public getComplaints(): Complaint[] {
    return [...this.data.complaints].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getComplaintsByStudentId(studentId: string): Complaint[] {
    return this.data.complaints
      .filter(c => c.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addComplaint(complaint: Complaint): Complaint {
    this.data.complaints.push(complaint);
    this.persist();
    return complaint;
  }

  public updateComplaint(id: string, updates: Partial<Complaint>): Complaint | null {
    const index = this.data.complaints.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.complaints[index] = {
      ...this.data.complaints[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.complaints[index];
  }

  public deleteComplaint(id: string): boolean {
    const initialLen = this.data.complaints.length;
    this.data.complaints = this.data.complaints.filter(c => c.id !== id);
    this.persist();
    return this.data.complaints.length < initialLen;
  }
}

export const db = new DatabaseEngine();
