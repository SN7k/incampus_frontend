import { User, Post, Comment, Media } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    universityId: 'BWU/BCA/20/001',
    role: 'student',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Computer Science student, class of 2024. Love coding and basketball!',
    coverPhoto: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '2',
    name: 'Jane Smith',
    universityId: 'BWU/BCA/20/045',
    role: 'student',
    avatar: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Digital Media major, photography enthusiast.',
    coverPhoto: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '3',
    name: 'Prof. Robert Williams',
    universityId: 'BWU/FAC/CS/012',
    role: 'faculty',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Professor of Computer Science. Research interests: AI and Machine Learning',
    coverPhoto: 'https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '4',
    name: 'Bapan Kumar',
    universityId: 'BWU/BCA/21/078',
    role: 'student',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Computer Science student with a passion for web development and AI.',
    coverPhoto: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '5',
    name: 'Raj Sharma',
    universityId: 'BWU/BCA/21/045',
    role: 'student',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Studying Computer Science. Interested in mobile app development and gaming.',
    coverPhoto: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
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
  // User 1 (John Doe) Posts
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
    likes: 0,
    comments: [],
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: '4',
    userId: '1',
    user: mockUsers[0],
    content: 'Study session at the library with friends. Preparing for finals!',
    media: [
      {
        id: '4',
        type: 'image',
        url: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    ],
    likes: 0,
    comments: [],
    createdAt: new Date(Date.now() - 43200000) // 12 hours ago
  },
  {
    id: '5',
    userId: '1',
    user: mockUsers[0],
    content: 'Attended an amazing workshop on AI today. Learned so much!',
    media: [
      {
        id: '5',
        type: 'image',
        url: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    ],
    likes: 0,
    comments: [],
    createdAt: new Date(Date.now() - 129600000) // 36 hours ago
  },

  // User 2 (Jane Smith) Posts
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
    likes: 0,
    comments: [
      createComment('3', '1', 'Perfect day for studying outside!'),
      createComment('4', '3', 'Great shot! Which building is this?')
    ],
    createdAt: new Date(Date.now() - 172800000)
  },
  {
    id: '6',
    userId: '2',
    user: mockUsers[1],
    content: 'Just finished my photography project! What do you think?',
    media: [
      {
        id: '6',
        type: 'image',
        url: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    ],
    likes: 0,
    comments: [],
    createdAt: new Date(Date.now() - 64800000) // 18 hours ago
  },
  {
    id: '7',
    userId: '2',
    user: mockUsers[1],
    content: 'Coffee and coding - perfect combination for a productive day!',
    media: [
      {
        id: '7',
        type: 'image',
        url: 'https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    ],
    likes: 0,
    comments: [],
    createdAt: new Date(Date.now() - 216000000) // 60 hours ago
  },

  // User 3 (Prof. Robert Williams) Posts
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
    likes: 0,
    comments: [
      createComment('5', '1', 'Thank you for the opportunity, Professor!'),
      createComment('6', '2', 'It was a great learning experience!')
    ],
    createdAt: new Date(Date.now() - 259200000)
  },
  {
    id: '8',
    userId: '3',
    user: mockUsers[2],
    content: 'Excited to announce that our AI research paper has been accepted at the International Conference on Machine Learning!',
    media: [
      {
        id: '8',
        type: 'image',
        url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    ],
    likes: 0,
    comments: [],
    createdAt: new Date(Date.now() - 108000000) // 30 hours ago
  },
  {
    id: '9',
    userId: '3',
    user: mockUsers[2],
    content: 'Reminder: Final project submissions for CS401 Advanced AI are due next Friday. Office hours are available for any questions.',
    likes: 0,
    comments: [],
    createdAt: new Date(Date.now() - 194400000) // 54 hours ago
  },

  // User 4 (Bapan Kumar) Posts
  {
    id: '10',
    userId: '4',
    user: mockUsers[3],
    content: 'Working on my new web development project. Can\'t wait to share it with everyone!',
    media: [
      {
        id: '10',
        type: 'image',
        url: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    ],
    likes: 0,
    comments: [],
    createdAt: new Date(Date.now() - 54000000) // 15 hours ago
  },
  {
    id: '11',
    userId: '4',
    user: mockUsers[3],
    content: 'Just joined the campus coding club! Looking forward to collaborating with fellow programmers.',
    likes: 0,
    comments: [],
    createdAt: new Date(Date.now() - 151200000) // 42 hours ago
  },

  // User 5 (Raj Sharma) Posts
  {
    id: '12',
    userId: '5',
    user: mockUsers[4],
    content: 'Our team won the inter-university hackathon! So proud of what we accomplished in just 24 hours.',
    media: [
      {
        id: '12',
        type: 'image',
        url: 'https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    ],
    likes: 0,
    comments: [],
    createdAt: new Date(Date.now() - 75600000) // 21 hours ago
  },
  {
    id: '13',
    userId: '5',
    user: mockUsers[4],
    content: 'Check out this cool mobile app I\'ve been working on for my final project!',
    media: [
      {
        id: '13',
        type: 'image',
        url: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    ],
    likes: 0,
    comments: [],
    createdAt: new Date(Date.now() - 237600000) // 66 hours ago
  }
];