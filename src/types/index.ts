export interface User {
  id: string;
  name: string;
  email: string;
  universityId: string;
  role: 'student' | 'faculty';
  avatar: string;
  department?: string;
  batch?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  bio?: string;
  coverPhoto?: string;
  relevance?: string[];
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
}