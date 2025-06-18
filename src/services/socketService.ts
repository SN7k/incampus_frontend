import React from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

interface SocketError {
  message: string;
}

interface FriendEventData {
  fromUser: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface PostEventData {
  postId: string;
  fromUser: {
    id: string;
    name: string;
    avatar: string;
  };
}

let socket: typeof Socket | null = null;

export const initializeSocket = () => {
  if (socket) {
    console.log('SocketService: Socket already exists, returning existing socket');
    return socket;
  }

  console.log('SocketService: Initializing new socket connection...');
  const token = localStorage.getItem('authState')
    ? JSON.parse(localStorage.getItem('authState')!).token
    : null;

  console.log('SocketService: Auth token found:', !!token);
  if (!token) {
    console.error('SocketService: No auth token found for socket connection');
    return null;
  }

  // Log token details (without exposing the full token)
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log('SocketService: Token payload:', { 
        id: payload.id, 
        exp: new Date(payload.exp * 1000).toISOString(),
        iat: new Date(payload.iat * 1000).toISOString()
      });
    }
  } catch (error) {
    console.error('SocketService: Error parsing token:', error);
  }

  const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://incampus-backend.onrender.com');
  console.log('SocketService: Connecting to:', apiUrl);
  console.log('SocketService: Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('SocketService: Current hostname:', window.location.hostname);

  socket = io(apiUrl, {
    auth: { token },
    timeout: 10000, // 10 second timeout
    forceNew: true
  });

  socket.on('connect', () => {
    console.log('SocketService: Socket connected successfully');
  });

  socket.on('connect_error', (error: SocketError) => {
    console.error('SocketService: Socket connection error:', error);
    // Attempt to reconnect if token is invalid
    if (error.message === 'Authentication error') {
      console.log('SocketService: Authentication error, clearing auth state');
      localStorage.removeItem('authState');
      window.location.href = '/login';
    }
  });

  socket.on('disconnect', () => {
    console.log('SocketService: Socket disconnected');
  });

  // Test response listener
  socket.on('test:response', (data: any) => {
    console.log('SocketService: Received test response from backend:', data);
  });

  console.log('SocketService: Socket initialization completed');
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const testConnection = () => {
  if (!socket) {
    console.log('SocketService: No socket to test');
    return false;
  }
  
  console.log('SocketService: Testing socket connection...');
  console.log('SocketService: Socket connected:', socket.connected);
  console.log('SocketService: Socket id:', socket.id);
  
  // Emit a test event
  socket.emit('test', { message: 'Hello from frontend' });
  
  return socket.connected;
};

export const isSocketReady = () => {
  const ready = socket && socket.connected;
  console.log('SocketService: isSocketReady check:', {
    socketExists: !!socket,
    socketConnected: socket?.connected,
    ready: ready
  });
  return ready;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event handlers
export const socketEvents = {
  // Friend events
  onFriendRequest: (callback: (data: FriendEventData) => void) => {
    console.log('SocketService: Setting up friend request listener');
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.on('friend:request', (data: FriendEventData) => {
        console.log('SocketService: Received friend:request event:', data);
        callback(data);
      });
      console.log('SocketService: Friend request listener set up successfully');
    } else {
      console.error('SocketService: No socket available or socket not connected for friend request listener');
      // Retry after a short delay
      setTimeout(() => {
        const retrySocket = getSocket();
        if (retrySocket && retrySocket.connected) {
          retrySocket.on('friend:request', (data: FriendEventData) => {
            console.log('SocketService: Received friend:request event (retry):', data);
            callback(data);
          });
          console.log('SocketService: Friend request listener set up successfully (retry)');
        }
      }, 1000);
    }
  },

  onFriendAccept: (callback: (data: FriendEventData) => void) => {
    console.log('SocketService: Setting up friend accept listener');
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.on('friend:accept', (data: FriendEventData) => {
        console.log('SocketService: Received friend:accept event:', data);
        callback(data);
      });
      console.log('SocketService: Friend accept listener set up successfully');
    } else {
      console.error('SocketService: No socket available or socket not connected for friend accept listener');
      // Retry after a short delay
      setTimeout(() => {
        const retrySocket = getSocket();
        if (retrySocket && retrySocket.connected) {
          retrySocket.on('friend:accept', (data: FriendEventData) => {
            console.log('SocketService: Received friend:accept event (retry):', data);
            callback(data);
          });
          console.log('SocketService: Friend accept listener set up successfully (retry)');
        }
      }, 1000);
    }
  },

  // Post events
  onPostLike: (callback: (data: PostEventData) => void) => {
    const socket = getSocket();
    if (socket) {
      socket.on('post:like', callback);
    }
  },

  onPostComment: (callback: (data: PostEventData) => void) => {
    const socket = getSocket();
    if (socket) {
      socket.on('post:comment', callback);
    }
  },

  // Emit events
  emitFriendRequest: (toUserId: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('friend:request', { toUserId });
    }
  },

  emitFriendAccept: (toUserId: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('friend:accept', { toUserId });
    }
  },

  emitPostLike: (postId: string, postAuthorId: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('post:like', { postId, postAuthorId });
    }
  },

  emitPostComment: (postId: string, postAuthorId: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('post:comment', { postId, postAuthorId });
    }
  },

  // Test socket connectivity
  testConnection: () => {
    const socket = getSocket();
    if (socket && socket.connected) {
      console.log('SocketService: Socket is connected and ready');
      return true;
    } else {
      console.log('SocketService: Socket is not connected');
      return false;
    }
  }
};

// Custom hook for using socket events
export const useSocket = () => {
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      const socket = initializeSocket();
      return () => {
        disconnectSocket();
      };
    }
  }, [isAuthenticated]);

  return socketEvents;
}; 