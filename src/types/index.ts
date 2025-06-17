export interface User {
  _id: string;
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
  _id: string;
  author: User;
  content: string;
  images?: {
    type: 'image' | 'video';
    url: string;
    publicId?: string;
  }[];
  likes: string[];
  comments: Comment[];
  createdAt: Date;
}

export interface Comment {
  _id: string;
  user: User;
  text: string;
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