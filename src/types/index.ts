export interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'subadmin' | 'alumni' | 'student' | 'user';
  universityId?: string;
  collegeId?: string;
  profilePicture?: string;
  createdAt: string;
  password?: string;
  phone?: string;
  /** Set by admins or institutional email domain match */
  verifiedAlumni?: boolean;
  /** Industry / sector for discovery filters */
  industry?: string;
  lastActiveAt?: string;
  openToMentoring?: boolean;
  /** When `private`, email/phone/address and social links are hidden except for accepted connections (and self). */
  profileVisibility?: 'public' | 'private';
}

export interface Alumni extends User {
  role: 'alumni';
  graduationYear: number;
  degree: string;
  department: string;
  currentCompany?: string;
  currentPosition?: string;
  location?: string;
  bio?: string;
  skills: string[];
  achievements: Achievement[];
  blogs: Blog[];
  connections: string[]; // Array of user IDs
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
    personal?: string;
  };
  phone?: string;
  address?: string;
  experience: WorkExperience[];
  education: Education[];
}

export interface Student extends User {
  role: 'student';
  currentYear: number;
  degree: string;
  department: string;
  rollNumber: string;
  connections: string[];
}

export interface CommonUser extends User {
  role: 'user';
  connections: string[];
  interests: string[];
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  current: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  grade?: string;
}

export interface University {
  id: string;
  name: string;
  location: string;
  logo?: string;
  description: string;
  colleges: College[];
  createdAt: string;
  establishedYear: number;
  website?: string;
  contactEmail: string;
  phone?: string;
}

export interface College {
  id: string;
  name: string;
  universityId: string;
  logo?: string;
  description: string;
  departments: string[];
  createdAt: string;
  establishedYear: number;
  website?: string;
  contactEmail: string;
  phone?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminContactNumber?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'academic' | 'professional' | 'personal' | 'community';
  image?: string;
  userId: string;
}

export type BlogStatus = 'draft' | 'published';
export type BlogModerationStatus = 'ok' | 'flagged' | 'removed';

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  authorId: string;
  author: Alumni;
  publishedAt: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  shares: number;
  status?: BlogStatus;
  moderationStatus?: BlogModerationStatus;
  reportCount?: number;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  blogId: string;
  createdAt: string;
}

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
  readAt?: string;
  deletedBy?: string[]; // Array of user IDs who deleted this message
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  exportUserData: () => Promise<void>;
}

/** Platform: events */
export interface PlatformEvent {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt?: string;
  location: string;
  organizerId: string;
  attendeeIds: string[];
  createdAt: string;
  collegeId?: string;
}

/** Job postings */
export interface JobApplication {
  userId: string;
  appliedAt: string;
  note?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  postedBy: string;
  remote: boolean;
  role: string;
  applications: JobApplication[];
  createdAt: string;
}

/** Mentorship */
export type MentorshipStatus = 'pending' | 'accepted' | 'declined' | 'completed';

export interface Mentorship {
  id: string;
  mentorId: string;
  menteeId: string;
  topic: string;
  status: MentorshipStatus;
  sessionDate?: string;
  createdAt: string;
}

export interface MentorshipMessage {
  id: string;
  mentorshipId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

/** Groups / chapters */
export type GroupType = 'chapter' | 'interest' | 'batch';

export interface Group {
  id: string;
  name: string;
  description: string;
  type: GroupType;
  members: string[];
  adminIds: string[];
  createdAt: string;
  batchYear?: number;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

/** In-app notifications */
export type NotificationType =
  | 'message'
  | 'connection'
  | 'comment'
  | 'event'
  | 'job_match'
  | 'mentorship'
  | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
  /** Who triggered the notification (for security rules) */
  actorId?: string;
  messageId?: string;
  mentorshipId?: string;
  /** Related entity ids for deep links */
  meta?: Record<string, string>;
}

export interface ContentReport {
  id: string;
  targetType: 'blog' | 'comment' | 'user';
  targetId: string;
  reporterId: string;
  reason: string;
  createdAt: string;
  status: 'open' | 'reviewed' | 'dismissed';
}