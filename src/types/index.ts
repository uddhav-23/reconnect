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
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}