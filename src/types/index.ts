export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export type StudentLevel = 'junior' | 'senior';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  studentLevel?: StudentLevel;
  grade?: number; // 8-12
  section?: string; // e.g. "9B", "12 Science A"
  eczNumber?: string;
  childStudentId?: string; // For parents
  childrenIds?: string[];
  subjectsTaught?: string[]; // For teachers
  designation?: string; // e.g. "Headteacher", "Deputy Headteacher (Academics)"
  mfaEnabled: boolean;
  mfaVerified: boolean;
}

export interface SubjectGrade {
  subjectId: string;
  subjectName: string;
  continuousAssessment: number; // max 40
  finalExam: number; // max 60
  total: number; // 0-100
  eczGrade: string; // '1' - '9'
  division: 'Distinction' | 'Merit' | 'Credit' | 'Satisfactory' | 'Unsatisfactory';
  teacherRemarks: string;
  teacherName: string;
  lastUpdated: string;
}

export interface AttendanceDay {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  periodRemarks?: string;
  timestamp?: string;
  method?: 'qr_scan' | 'manual' | 'biometric';
  sessionName?: string;
  scannedBy?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'academic' | 'attendance' | 'assignment' | 'club' | 'streak';
  unlockedAt?: string;
  xpValue: number;
}

export interface AssignmentTask {
  id: string;
  title: string;
  subject: string;
  level: StudentLevel;
  grade: number;
  dueDate: string;
  xpReward: number;
  completed: boolean;
  score?: number;
  maxScore: number;
  description: string;
}

export interface GamificationProfile {
  totalXp: number;
  level: number;
  title: string;
  streakDays: number;
  assignmentsCompleted: number;
  badges: Badge[];
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  grade: number;
  stream: string;
  avatar: string;
  subjectName?: string;
  scoreOrXp: number;
  badgesCount: number;
  trend: 'up' | 'down' | 'same';
}

export interface StudentRecord {
  id: string;
  fullName: string;
  gender: 'M' | 'F';
  dob: string;
  level: StudentLevel;
  grade: number; // 8 to 12
  stream: string; // e.g. "8A", "9B", "10 Science", "12 Science A"
  eczExamNumber: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  avatar: string;
  grades: SubjectGrade[];
  attendanceRate: number; // percentage
  attendanceHistory: AttendanceDay[];
  clubs: string[];
  conduct: 'Exemplary' | 'Very Good' | 'Good' | 'Needs Improvement';
  termFeesPaid: boolean;
  balanceZMW: number;
  gamification: GamificationProfile;
  avatarAura?: string;
  avatarBadgeAccessory?: string;
  avatarTierName?: string;
}

export interface ConferenceSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherDesignation: string;
  subject: string;
  avatar: string;
  date: string;
  timeSlot: string; // e.g. "14:00 - 14:20"
  location: string; // e.g. "Staff Office 4 / WhatsApp Call"
  isBooked: boolean;
}

export interface ConferenceBooking {
  id: string;
  slotId: string;
  teacherId: string;
  teacherName: string;
  parentId: string;
  parentName: string;
  studentId: string;
  studentName: string;
  studentGrade: string;
  date: string;
  timeSlot: string;
  meetingMode: 'In-Person (School)' | 'WhatsApp Video Call';
  discussionTopic: string;
  status: 'Confirmed' | 'Pending Confirmation' | 'Completed' | 'Cancelled';
  teacherNotes?: string;
  reminderSent: boolean;
}

export type CourseMaterial = LibraryResource;

export interface LibraryResource {
  id: string;
  title: string;
  subject: string;
  level: StudentLevel;
  grade: number;
  category: 'Textbook' | 'ECZ Past Paper' | 'Revision Guide' | 'Supplementary Reading' | 'Lab Manual';
  fileFormat: 'PDF' | 'EPUB' | 'ZIP';
  fileSize: string;
  uploaderName: string;
  uploaderRole: string;
  uploadDate: string;
  downloadsCount: number;
  isCachedOffline: boolean;
  description: string;
  recommendedByClass?: string; // e.g. "Grade 12 Science A - Recommended by Mr. Tembo"
  recommendedTeacherName?: string;
  previewSnippet?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'exam' | 'sports' | 'club' | 'pta' | 'holiday';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  targetAudience: 'All' | 'Junior' | 'Senior' | 'Parents' | 'Teachers';
  reminderSet?: boolean;
}

export interface Club {
  id: string;
  name: string;
  category: 'Science & Tech' | 'Academics & Debate' | 'Community Service' | 'Sports & Athletics' | 'Arts & Culture';
  patronName: string;
  meetingDay: string;
  meetingTime: string;
  venue: string;
  membersCount: number;
  maxCapacity: number;
  description: string;
  achievements: string[];
  chatGroupId: string;
  isEnrolled?: boolean;
  coverImage: string;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachment?: {
    type: 'pdf' | 'image' | 'voice';
    name: string;
    size: string;
    duration?: string;
  };
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
}

export interface ChatGroup {
  id: string;
  name: string;
  type: 'club' | 'pta_teacher' | 'direct' | 'department';
  avatar: string;
  description: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  membersCount: number;
  badge?: string;
  isOfficial?: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  type: 'grade' | 'attendance' | 'event' | 'chat' | 'conference' | 'library' | 'gamification';
  timestamp: string;
  read: boolean;
  linkAction?: string;
  priority: 'normal' | 'high';
}

export interface SchoolPerformanceMetrics {
  totalStudents: number;
  juniorStudents: number;
  seniorStudents: number;
  totalTeachers: number;
  averageAttendanceToday: number;
  juniorPassRate: number;
  seniorPassRate: number;
  eczDistinctionRate: number;
  feeComplianceRate: number;
  topPerformingSubjects: { subject: string; average: number; distinctions: number }[];
  gradeDistribution: { grade: string; count: number }[];
}

export interface FeedbackSubmission {
  id: string;
  senderName: string;
  email: string;
  phone: string;
  category: 'General Inquiry' | 'Admissions' | 'ECZ Verification' | 'Technical Support' | 'Complaint / Suggestion';
  subject: string;
  message: string;
  createdAt: string;
  status: 'Received' | 'In Review' | 'Resolved';
}
