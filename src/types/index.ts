export interface User {
  id: string;
  name: string;
  email: string;
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

export interface StudentWithStats extends User {
  subjectsCount: number;
  averageAttendance: number;
  hasShortage: boolean;
  complaintsCount: number;
  issuedBooksCount: number;
}

export interface DashboardStats {
  // Student stats
  averageAttendance?: number;
  totalSubjects?: number;
  hasShortageWarning?: boolean;
  shortageSubjects?: string[];
  availableBooks?: number;
  totalBooks?: number;
  latestNewsCount?: number;
  myComplaintsCount?: number;
  myActiveComplaints?: number;
  myBorrowedBooksCount?: number;

  // Admin stats
  totalStudents?: number;
  campusAvgAttendance?: number;
  issuedBooks?: number;
  totalNews?: number;
  openComplaints?: number;
  inProgressComplaints?: number;
  resolvedComplaints?: number;
  totalComplaints?: number;
}
