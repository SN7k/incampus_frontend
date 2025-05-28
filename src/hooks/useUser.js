import { useState, useEffect } from 'react';
import axios from 'axios';

const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/user/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(response.data.data.user);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching user data');
        if (err.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  return { user, loading, error, updateUser };
};

export default useUser; 