export interface User {
  id: string;
  name: string;
  universityId: string;
  role: 'student' | 'faculty';
  avatar: {
    url: string;
    publicId?: string;
  };
  bio?: string;
  coverPhoto?: {
    url: string;
    publicId?: string;
  };
  email?: string;
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