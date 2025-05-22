export interface User {
  _id: string;
  id?: string; // For backward compatibility
  name: string;
  email: string;
  universityId: string;
  role: 'student' | 'teacher' | 'admin' | 'faculty'; // Include all possible role values
  avatar: string; // Make required to match AuthContext usage
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