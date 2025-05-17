import { User, Post, Comment } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Shombhunath Karan',
    universityId: 'BWU/BCA/23/734',
    email: 'karanshombhu@gmail.com',
    role: 'student',
    program: 'BCA',
    batch: '2023-2027',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Computer Science student, class of 2024. Love coding and basketball!',
    coverPhoto: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '2',
    name: 'Soumyajit Ghosh',
    universityId: 'BWU/BCA/23/735',
    email: 'sumyajit123@gmail.com',
    role: 'student',
    program: 'BCA',
    batch: '2023-2027',
    avatar: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Digital Media major, photography enthusiast.',
    coverPhoto: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '3',
    name: 'Prof. Robert Williams',
    universityId: 'BWU/FAC/CS/012',
    email: 'robert.cs@brainwareuniversity.ac.in',
    role: 'faculty',
    program: 'Computer Science',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Professor of Computer Science. Research interests: AI and Machine Learning',
    coverPhoto: 'https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
];

const createComment = (id: string, userId: string, content: string): Comment => {
  const user = mockUsers.find(u => u.id === userId)!;
  return {
    id,
    userId,
    user,
    content,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000))
  };
};

export const mockPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    user: mockUsers[0],
    content: 'Just finished my final project for the Programming class! #ProudMoment',
    media: [
      {
        id: '1',
        type: 'image',
        url: 'https://images.pexels.com/photos/169573/pexels-photo-169573.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    ],
    likes: 24,
    comments: [
      createComment('1', '2', 'Congratulations! Looks amazing!'),
      createComment('2', '3', 'Great work! I\'m impressed with your progress.')
    ],
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: '2',
    userId: '2',
    user: mockUsers[1],
    content: 'Campus looks beautiful today! Spring is finally here ❤️',
    media: [
      {
        id: '2',
        type: 'image',
        url: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    ],
    likes: 42,
    comments: [
      createComment('3', '1', 'Perfect day for studying outside!'),
      createComment('4', '3', 'Great shot! Which building is this?')
    ],
    createdAt: new Date(Date.now() - 172800000)
  },
  {
    id: '3',
    userId: '3',
    user: mockUsers[2],
    content: 'Proud of my students for their amazing presentations today! The future is bright.',
    media: [
      {
        id: '3',
        type: 'image',
        url: 'https://images.pexels.com/photos/6147369/pexels-photo-6147369.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    ],
    likes: 56,
    comments: [
      createComment('5', '1', 'Thank you for the opportunity, Professor!'),
      createComment('6', '2', 'It was a great learning experience!')
    ],
    createdAt: new Date(Date.now() - 259200000)
  }
];