import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const useFriends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get('/api/friends');
      setFriends(response.data.data.friends);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching friends');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const addFriend = async (friendId) => {
    try {
      const response = await axiosInstance.post('/api/friends', { receiverId: friendId });
      // Refresh friends list after adding
      fetchFriends();
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error adding friend');
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await axiosInstance.delete(`/api/friends/${friendId}`);
      // Refresh friends list after removing
      fetchFriends();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error removing friend');
    }
  };

  return {
    friends,
    loading,
    error,
    addFriend,
    removeFriend,
    refreshFriends: fetchFriends
  };
};

export default useFriends; 