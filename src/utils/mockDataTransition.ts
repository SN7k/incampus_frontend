import { ProfileData } from '../types/profile';
import { Post, User } from '../types';
import { mockUsers } from '../data/mockData';

// Flag to control whether to use mock data or real API
// This can be controlled by an environment variable
// Default to false (use real API) when environment variable is not set
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

// Function to get mock profile data for a user
export const getMockProfileData = (userId: string): ProfileData => {
  // Find the user in mockUsers
  const userToView = mockUsers.find(u => u.id === userId) || mockUsers[0];
  
  // Faculty profile
  if (userId === '3') {
    return {
      id: userId,
      name: 'Prof. Robert Williams',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      bio: 'Professor of Computer Science with over 15 years of experience in AI research and education. Leading the AI Research Lab at Blue Waters University.',
      coverPhoto: 'https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      education: {
        degree: 'Ph.D. in Computer Science',
        institution: 'Stanford University',
        years: '2005-2010'
      },
      location: 'Blue Waters University',
      skills: [
        { name: 'Artificial Intelligence', proficiency: 95 },
        { name: 'Machine Learning', proficiency: 90 },
        { name: 'Python', proficiency: 85 },
        { name: 'Research Methodology', proficiency: 95 }
      ],
      achievements: [
        { title: 'Best Faculty Award', description: 'Recognized for excellence in teaching and research', year: '2024' },
        { title: 'Research Grant', description: 'Secured $1.2M grant for AI research project', year: '2023' },
        { title: 'Published Book', description: 'Author of "Advanced Machine Learning Techniques"', year: '2022' }
      ],
      interests: ['Artificial Intelligence', 'Machine Learning', 'Computer Vision', 'Education Technology'],
      posts: getMockFacultyPosts(userId),
      universityId: 'BWU/FAC/CS/012'
    };
  } else {
    // Student profile
    return {
      id: userId,
      name: userToView.name || 'Jane Smith',
      avatar: userToView.avatar || 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=150',
      bio: 'Computer Science student passionate about web development and AI.',
      coverPhoto: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      education: {
        degree: 'Bachelor of Computer Applications',
        institution: 'Blue Waters University',
        years: '2022-2025'
      },
      location: 'Blue Waters University',
      skills: [
        { name: 'JavaScript', proficiency: 85 },
        { name: 'React', proficiency: 80 },
        { name: 'Node.js', proficiency: 75 }
      ],
      achievements: [
        { title: 'Hackathon Winner', description: 'First place in the BWU Hackathon 2024', year: '2024' },
        { title: 'Dean\'s List', description: 'Academic excellence award', year: '2023' }
      ],
      interests: ['Web Development', 'Artificial Intelligence', 'Mobile Apps'],
      posts: getMockStudentPosts(userId, userToView.name, userToView.avatar),
      universityId: userToView.id ? `BWU/BCA/20/${userToView.id}` : 'BWU/BCA/20/045'
    };
  }
};

// Helper function to get mock faculty posts
function getMockFacultyPosts(userId: string): Post[] {
  return [
    {
      id: 'faculty-post-1',
      userId,
      user: {
        id: userId,
        name: 'Prof. Robert Williams',
        universityId: 'BWU/FAC/CS/012',
        role: 'faculty',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      content: 'Excited to announce that our AI research paper has been accepted at the International Conference on Machine Learning! Proud of my student researchers.',
      media: [{
        id: 'faculty-media-1',
        type: 'image',
        url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }],
      likes: 45,
      comments: [],
      createdAt: new Date('2025-05-17T14:30:00')
    },
    {
      id: 'faculty-post-2',
      userId,
      user: {
        id: userId,
        name: 'Prof. Robert Williams',
        universityId: 'BWU/FAC/CS/012',
        role: 'faculty',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      content: 'Reminder: Final project submissions for CS401 Advanced AI are due next Friday. Office hours are available for any questions.',
      likes: 32,
      comments: [],
      createdAt: new Date('2025-05-15T09:15:00')
    }
  ];
}

// Helper function to get mock student posts
function getMockStudentPosts(userId: string, name?: string, avatar?: string): Post[] {
  return [
    {
      id: 'friend-post-1',
      userId,
      user: {
        id: userId,
        name: name || 'Jane Smith',
        universityId: 'BWU/BCA/20/045',
        role: 'student',
        avatar: avatar || 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      content: 'Just finished my final project for Web Development class! #coding #webdev',
      media: [{
        id: 'media-1',
        type: 'image',
        url: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }],
      likes: 24,
      comments: [],
      createdAt: new Date('2025-05-18T10:30:00')
    },
    {
      id: 'friend-post-2',
      userId,
      user: {
        id: userId,
        name: name || 'Jane Smith',
        universityId: 'BWU/BCA/20/045',
        role: 'student',
        avatar: avatar || 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      content: 'Study session at the library with friends. Preparing for finals!',
      media: [{
        id: 'media-2',
        type: 'image',
        url: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }],
      likes: 18,
      comments: [],
      createdAt: new Date('2025-05-15T14:20:00')
    }
  ];
}
