// Import existing types to ensure compatibility
import { User as AppUser, Post as AppPost, Media as AppMedia } from '../types';

// Profile related types
export interface Skill {
  name: string;
  proficiency: number;
}

export interface Achievement {
  title: string;
  description: string;
  year: string;
}

export interface Education {
  degree: string;
  institution: string;
  years: string;
}

// Re-export the existing types to avoid conflicts
export type User = AppUser;
export type Post = AppPost;
export type Media = AppMedia;

export interface ProfileData {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  coverPhoto: string;
  education: Education;
  location: string;
  skills: Skill[];
  achievements: Achievement[];
  interests: string[];
  posts: Post[];
  universityId: string;
}

// API response types
export interface ProfileResponse {
  status: string;
  data: {
    profile: ProfileData;
  };
}

export interface ErrorResponse {
  status: string;
  message: string;
}
