import { useState } from 'react';
import useFriends from '../hooks/useFriends';
import LoadingSpinner from './LoadingSpinner';

const FriendsList = () => {
  const { friends, loading, error, removeFriend } = useFriends();
  const [removingId, setRemovingId] = useState(null);

  const handleRemoveFriend = async (friendId) => {
    try {
      setRemovingId(friendId);
      await removeFriend(friendId);
    } catch (err) {
      alert(err.message);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error: {error}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-gray-500 text-center p-4">
        No friends yet. Start adding some!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {friends.map((friend) => (
        <div
          key={friend._id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
        >
          <div className="flex items-center space-x-3">
            <img
              src={friend.avatar || 'https://via.placeholder.com/40'}
              alt={friend.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-medium">{friend.name}</h3>
              <p className="text-sm text-gray-500">{friend.email}</p>
            </div>
          </div>
          <button
            onClick={() => handleRemoveFriend(friend._id)}
            disabled={removingId === friend._id}
            className={`px-3 py-1 text-sm rounded ${
              removingId === friend._id
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {removingId === friend._id ? 'Removing...' : 'Remove'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default FriendsList; 