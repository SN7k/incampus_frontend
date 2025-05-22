import { User } from './index';

// Define a comprehensive user type that includes all properties needed across components
export interface ExtendedUser extends User {
  // Required properties
  id: string;
  name: string;
  email: string;
  universityId: string;
  role: 'student' | 'faculty';
  avatar: string;
  
  // Optional properties that might be present in API responses
  _id?: string;
  isVerified?: boolean;
  __v?: number;
}

export interface Post {
  id: string;
  content: string;
  images?: string[];
  user: ExtendedUser;
  likes: number;
  comments: any[];
  createdAt: string;
  updatedAt: string;
  media?: Media[];
}

interface Media {
  type: 'image' | 'video';
  url: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
} 