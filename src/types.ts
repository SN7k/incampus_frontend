export interface User {
  _id: string;
  id?: string; // For backward compatibility
  name: string;
  email: string;
  role: 'student' | 'faculty';
  collegeId?: string;
  isVerified: boolean;
  createdAt: string;
  __v: number;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  department?: string;
  program?: string;
  batch?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  loading: boolean;
} 