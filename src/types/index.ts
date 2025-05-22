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
  content: string;
  images?: string[];
  user: User;
  likes: number;
  comments: any[];
  createdAt: string;
  updatedAt: string;
  media?: Media[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
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