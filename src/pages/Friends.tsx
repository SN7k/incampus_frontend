import React, { useState } from 'react';
import './friends.css';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useFriends } from '../contexts/FriendContext';
import { UserPlus, Check, X, UserCheck, User as UserIcon } from 'lucide-react';
import Button from '../components/ui/Button';

const Friends: React.FC = () => {
  const { user } = useAuth();
  const { 
    friends, 
    friendRequests, 
    suggestedFriends, 
    pendingRequests,
    acceptFriendRequest, 
    rejectFriendRequest, 
    sendFriendRequest,
    removeFriend,
    loading
  } = useFriends();
  
  // Check if there's an active tab stored in sessionStorage
  const getInitialTab = (): 'all' | 'requests' | 'suggestions' => {
    const storedTab = sessionStorage.getItem('friendsActiveTab');
    if (storedTab === 'all' || storedTab === 'requests' || storedTab === 'suggestions') {
      // Clear the stored tab after retrieving it
      sessionStorage.removeItem('friendsActiveTab');
      return storedTab;
    }
    return 'all';
  };
  
  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'suggestions'>(getInitialTab());
  
  if (!user) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="pt-2 pb-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6"
        >
          <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
            <button 
              className={`flex-1 px-2 py-3 font-medium flex items-center justify-center ${activeTab === 'all' ? 'text-blue-800 dark:text-blue-400 border-b-2 border-blue-800 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
              onClick={() => setActiveTab('all')}
            >
              <UserCheck size={16} className="mr-1" />
              <span className="text-xs">Friends</span>
              {friends.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                  {friends.length}
                </span>
              )}
            </button>
            <button 
              className={`flex-1 px-2 py-3 font-medium flex items-center justify-center ${activeTab === 'requests' ? 'text-blue-800 dark:text-blue-400 border-b-2 border-blue-800 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
              onClick={() => setActiveTab('requests')}
            >
              <UserPlus size={16} className="mr-1" />
              <span className="text-xs">Requests</span>
              {friendRequests.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {friendRequests.length}
                </span>
              )}
            </button>
            <button 
              className={`flex-1 px-2 py-3 font-medium flex items-center justify-center ${activeTab === 'suggestions' ? 'text-blue-800 dark:text-blue-400 border-b-2 border-blue-800 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
              onClick={() => setActiveTab('suggestions')}
            >
              <UserPlus size={16} className="mr-1" />
              <span className="text-xs">Suggestions</span>
              {suggestedFriends.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-500 rounded-full">
                  {suggestedFriends.length}
                </span>
              )}
            </button>

          </div>
        </motion.div>

        {activeTab === 'all' && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {friends.length > 0 ? (
              friends.map(friend => (
                <motion.div
                  key={friend.id}
                  variants={item}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex items-center p-4"
                >
                  <img 
                    src={friend.avatar} 
                    alt={friend.name} 
                    className="w-14 h-14 rounded-full object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{friend.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{friend.program || friend.role}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      Message
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeFriend(friend.id)}
                      className="p-2 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                variants={item} 
                className="col-span-full text-center py-10"
              >
                <UserIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No friends at the moment</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {friendRequests.length > 0 ? (
              friendRequests.map(request => (
                <motion.div
                  key={request.id}
                  variants={item}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex items-center p-4"
                >
                  <img 
                    src={request.avatar} 
                    alt={request.name} 
                    className="w-14 h-14 rounded-full object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{request.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{request.program || request.role}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => acceptFriendRequest(request.id)}
                      className="p-2"
                      disabled={loading}
                    >
                      <Check size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => rejectFriendRequest(request.id)}
                      className="p-2"
                      disabled={loading}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                variants={item} 
                className="col-span-full text-center py-10"
              >
                <UserIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No friend requests at the moment</p>
              </motion.div>
            )}
            
            {pendingRequests.length > 0 && (
              <>
                <div className="col-span-full mt-8 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Pending Requests</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Friend requests you've sent that are waiting for approval</p>
                </div>
                
                {pendingRequests.map(pending => (
                  <motion.div
                    key={pending.id}
                    variants={item}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex items-center p-4"
                  >
                    <img 
                      src={pending.avatar} 
                      alt={pending.name} 
                      className="w-14 h-14 rounded-full object-cover mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{pending.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{pending.program || pending.role}</p>
                    </div>
                    <span className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                      Pending
                    </span>
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'suggestions' && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {suggestedFriends.length > 0 ? (
              suggestedFriends.map(suggestion => (
                <motion.div
                  key={suggestion.id}
                  variants={item}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex items-center p-4"
                >
                  <img 
                    src={suggestion.avatar} 
                    alt={suggestion.name} 
                    className="w-14 h-14 rounded-full object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{suggestion.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{suggestion.program || suggestion.role}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => sendFriendRequest(suggestion.id)}
                    disabled={loading || pendingRequests.some(p => p.id === suggestion.id)}
                  >
                    <UserPlus size={16} className="mr-1" />
                    {pendingRequests.some(p => p.id === suggestion.id) ? 'Pending' : 'Connect'}
                  </Button>
                </motion.div>
              ))
            ) : (
              <motion.div 
                variants={item} 
                className="col-span-full text-center py-10"
              >
                <UserIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No friend suggestions at the moment</p>
              </motion.div>
            )}
          </motion.div>
        )}
        

      </div>
    </div>
  );
};

export default Friends;
