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
  if (socket) return socket;

  const token = localStorage.getItem('authState')
    ? JSON.parse(localStorage.getItem('authState')!).token
    : null;

  if (!token) {
    console.error('No auth token found for socket connection');
    return null;
  }

  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
    auth: { token }
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('connect_error', (error: SocketError) => {
    console.error('Socket connection error:', error);
    // Attempt to reconnect if token is invalid
    if (error.message === 'Authentication error') {
      localStorage.removeItem('authState');
      window.location.href = '/login';
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const isSocketReady = () => {
  return socket && socket.connected;
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