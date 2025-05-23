import AddFriend from '../components/AddFriend';
import FriendsList from '../components/FriendsList';

const Friends = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Friends</h1>
      <AddFriend />
      <FriendsList />
    </div>
  );
};

export default Friends; 