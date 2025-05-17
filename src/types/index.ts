export interface User {
  id: string;
  name: string;
  universityId: string;
  email: string;
  role: 'student' | 'faculty';
  program?: string;
  batch?: string;
  avatar: string;
  bio?: string;
  coverPhoto?: string;
  education?: string;
  hometown?: string;
  phone?: string;
  interests?: string[];
  achievements?: string[];
}

export interface SignupData {
  name: string;
  email: string;
  universityId: string;
  role: 'student' | 'faculty';
  program: string;
  batch: string;
  password: string;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  media?: Media[];
  likes: number;
  comments: Comment[];
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  content: string;
  createdAt: Date;
}

export interface Media {
  id: string;
  type: 'image' | 'video';
  url: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  loading: boolean;
  profileSetupComplete: boolean;
}