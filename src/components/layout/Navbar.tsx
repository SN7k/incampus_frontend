import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, Bell, MessageSquare, Home, Users, LogOut, Settings, HelpCircle, Moon, MessageCircle, ChevronLeft, X } from 'lucide-react';
import Button from '../ui/Button';
import NotificationsPanel from '../notifications/NotificationsPanel';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { setMode } = useTheme(); // Using the theme context to enable dark mode styles
  const { 
    notifications, 
    unreadCount, 
    showNotifications, 
    toggleNotifications, 
    markAsRead, 
    acceptFriendRequest, 
    rejectFriendRequest 
  } = useNotifications();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDarkModePanel, setShowDarkModePanel] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  
  const notificationsPanelRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchPopupRef = useRef<HTMLDivElement>(null);

  // Toggle function removed as we're using profile menu instead

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Search query:', searchQuery);
  };
  
  // Close notifications panel, profile menu, search popup, and display panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsPanelRef.current &&
        !notificationsPanelRef.current.contains(event.target as Node) &&
        showNotifications
      ) {
        toggleNotifications();
      }
      
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
        setShowDarkModePanel(false);
      }

      if (searchPopupRef.current && !searchPopupRef.current.contains(event.target as Node)) {
        setShowSearchPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, toggleNotifications, showSearchPopup]);

  if (!isAuthenticated || !user) {
    return null; // Don't show navbar for unauthenticated users
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">InCampus</h1>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-2">
              <button 
                onClick={() => onNavigate('feed')}
                className={`px-3 py-2 rounded-md text-base font-medium ${currentPage === 'feed' ? 'text-blue-800 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-700 dark:text-gray-300'} hover:text-blue-800 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800`}
              >
                <div className="flex items-center">
                  <Home size={20} className="mr-2" />
                  Feed
                </div>
              </button>
              
              <button 
                onClick={() => onNavigate('friends')}
                className={`px-3 py-2 rounded-md text-base font-medium ${currentPage === 'friends' ? 'text-blue-800 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-700 dark:text-gray-300'} hover:text-blue-800 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800`}
              >
                <div className="flex items-center">
                  <Users size={20} className="mr-2" />
                  Friends
                </div>
              </button>
              
              {/* Courses button removed as requested */}
            </div>
          </div>
          
          {/* Search bar - desktop view */}
          <div className="flex-1 hidden md:flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  className="w-full py-2 pl-10 pr-4 text-base rounded-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search InCampus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          </div>
          
          {/* Search button is now moved to the mobile navbar buttons container */}
          
          {/* Search popup for mobile */}
          <AnimatePresence>
            {showSearchPopup && (
              <motion.div
                ref={searchPopupRef}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-x-0 top-16 z-50 p-4 bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700"
              >
                <div className="relative">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      className="w-full py-2 pl-10 pr-10 text-base rounded-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search friends..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      onClick={() => setShowSearchPopup(false)}
                    >
                      <X size={18} />
                    </button>
                  </form>
                  
                  {/* Search results would go here */}
                  {searchQuery.trim() !== '' && (
                    <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg shadow-inner p-2 max-h-60 overflow-y-auto">
                      <p className="text-sm text-gray-500 dark:text-gray-400 p-2">Search results for friends will appear here</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* User menu */}
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-3">
              <Button 
                variant="ghost" 
                className={`p-2 rounded-full ${currentPage === 'messages' ? 'bg-blue-100 text-blue-800' : ''}`}
                onClick={() => onNavigate('messages')}
              >
                <MessageSquare size={20} />
              </Button>
              
              {/* Notification button with panel */}
              <div className="relative">
                <Button 
                  variant="navbar" 
                  className="p-2.5 rounded-full relative "
                  onClick={toggleNotifications}
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                
                {/* Desktop Notifications Panel */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      ref={notificationsPanelRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 z-50"
                    >
                      <NotificationsPanel 
                        notifications={notifications}
                        onMarkAsRead={markAsRead}
                        onAcceptFriendRequest={acceptFriendRequest}
                        onRejectFriendRequest={rejectFriendRequest}
                        onClose={toggleNotifications}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center focus:outline-none"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer"
                  />
                </button>
                
                {/* Profile Menu */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div 
                      ref={profileMenuRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      {!showDarkModePanel ? (<>
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-blue-100 dark:border-blue-700"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{user.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.universityId}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            onNavigate('profile');
                            setShowProfileMenu(false);
                          }}
                          className="mt-3 w-full text-center text-sm text-blue-800 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          See all profiles
                        </button>
                      </div>
                      
                      <div className="py-1">
                        <button 
                          onClick={() => {
                            // Handle settings
                            setShowProfileMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Settings size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                          Settings & privacy
                        </button>
                        
                        <button 
                          onClick={() => {
                            // Handle help
                            setShowProfileMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <HelpCircle size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                          Help & support
                        </button>
                        
                        <button 
                          onClick={() => {
                            setShowDarkModePanel(true);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Moon size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                          Display & accessibility
                        </button>
                        
                        <button 
                          onClick={() => {
                            // Handle feedback
                            setShowProfileMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MessageCircle size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                          Give feedback
                        </button>
                        
                        <button 
                          onClick={() => {
                            logout();
                            setShowProfileMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <LogOut size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                          Log Out
                        </button>
                      </div>
                      </>) : (
                        <div className="p-4">
                          <div className="flex items-center mb-4">
                            <button 
                              onClick={() => setShowDarkModePanel(false)}
                              className="mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">Display & accessibility</h3>
                          </div>
                          
                          <div className="space-y-3">
                            <button 
                              onClick={() => {
                                setMode('light');
                                setShowProfileMenu(false);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                <span className="text-yellow-500">☀️</span>
                              </div>
                              Light mode
                            </button>
                            
                            <button 
                              onClick={() => {
                                setMode('dark');
                                setShowProfileMenu(false);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center mr-3">
                                <span>🌙</span>
                              </div>
                              Dark mode
                            </button>
                            
                            <button 
                              onClick={() => {
                                setMode('system');
                                setShowProfileMenu(false);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-100 to-gray-800 flex items-center justify-center mr-3">
                                <span>⚙️</span>
                              </div>
                              System default
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile menu button, chat button and notification button */}
            <div className="md:hidden flex items-center justify-end space-x-3">
              <Button
                variant="navbar"
                className="p-2.5 rounded-full"
                onClick={() => setShowSearchPopup(true)}
              >
                <Search size={22} />
              </Button>
              
              <Button 
                variant="navbar" 
                className={`p-2.5 rounded-full ${currentPage === 'messages' ? 'bg-blue-100 text-blue-800' : ''}`}
                onClick={() => onNavigate('messages')}
              >
                <MessageSquare size={22} />
              </Button>
              
              {/* Mobile Notification button with panel */}
              <div className="relative">
                <Button 
                  variant="navbar" 
                  className="p-2.5 rounded-full relative "
                  onClick={toggleNotifications}
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                
                {/* Mobile Notifications Panel */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      ref={notificationsPanelRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 z-50"
                    >
                      <NotificationsPanel 
                        notifications={notifications}
                        onMarkAsRead={markAsRead}
                        onAcceptFriendRequest={acceptFriendRequest}
                        onRejectFriendRequest={rejectFriendRequest}
                        onClose={toggleNotifications}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="relative ml-1">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="focus:outline-none"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer"
                  />
                </button>
                
                {/* Mobile Profile Menu */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div 
                      ref={profileMenuRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      {!showDarkModePanel ? (<>
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-blue-100 dark:border-blue-700"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{user.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.universityId}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            onNavigate('profile');
                            setShowProfileMenu(false);
                          }}
                          className="mt-3 w-full text-center text-sm text-blue-800 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          See all profiles
                        </button>
                      </div>
                      
                      <div className="py-1">
                        <button 
                          onClick={() => {
                            // Handle settings
                            setShowProfileMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Settings size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                          Settings & privacy
                        </button>
                        
                        <button 
                          onClick={() => {
                            // Handle help
                            setShowProfileMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <HelpCircle size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                          Help & support
                        </button>
                        
                        <button 
                          onClick={() => {
                            setShowDarkModePanel(true);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Moon size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                          Display & accessibility
                        </button>
                        
                        <button 
                          onClick={logout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut size={18} className="mr-3 text-red-500 dark:text-red-400" />
                          Log out
                        </button>
                      </div>
                      </>) : (
                        <div className="p-4">
                          <div className="flex items-center mb-4">
                            <button 
                              onClick={() => setShowDarkModePanel(false)}
                              className="mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">Display & accessibility</h3>
                          </div>
                          
                          <div className="space-y-3">
                            <button 
                              onClick={() => {
                                setMode('light');
                                setShowProfileMenu(false);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                <span className="text-yellow-500">☀️</span>
                              </div>
                              Light mode
                            </button>
                            
                            <button 
                              onClick={() => {
                                setMode('dark');
                                setShowProfileMenu(false);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center mr-3">
                                <span>🌙</span>
                              </div>
                              Dark mode
                            </button>
                            
                            <button 
                              onClick={() => {
                                setMode('system');
                                setShowProfileMenu(false);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-100 to-gray-800 flex items-center justify-center mr-3">
                                <span>⚙️</span>
                              </div>
                              System default
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-800 shadow-lg"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button 
                onClick={() => {
                  onNavigate('feed');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium ${currentPage === 'feed' ? 'text-blue-800 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-700 dark:text-gray-300'} hover:text-blue-800 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800`}
              >
                <Home size={20} className="mr-3" />
                Feed
              </button>
              
              <button 
                onClick={() => {
                  onNavigate('friends');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium ${currentPage === 'friends' ? 'text-blue-800 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-700 dark:text-gray-300'} hover:text-blue-800 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800`}
              >
                <Users size={20} className="mr-3" />
                Friends
              </button>
            </div>
            
            {/* No additional menu items needed here as both Messages and Notifications are now in the navbar */}
            
            <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800 cursor-pointer"
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                    />
                    
                    {/* Profile menu that appears when clicking profile image */}
                    <AnimatePresence>
                      {showProfileMenu && (
                        <motion.div 
                          ref={profileMenuRef}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden z-50"
                        >
                          {!showDarkModePanel ? (<>
                          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-blue-100 dark:border-blue-700"
                              />
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">{user.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.universityId}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                onNavigate('profile');
                                setShowProfileMenu(false);
                                setIsMenuOpen(false);
                              }}
                              className="mt-3 w-full text-center text-sm text-blue-800 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                            >
                              See all profiles
                            </button>
                          </div>
                          
                          <div className="py-1">
                            <button 
                              onClick={() => {
                                // Handle settings
                                setShowProfileMenu(false);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Settings size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                              Settings & privacy
                            </button>
                            
                            <button 
                              onClick={() => {
                                // Handle help
                                setShowProfileMenu(false);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <HelpCircle size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                              Help & support
                            </button>
                            
                            <button 
                              onClick={() => {
                                setShowDarkModePanel(true);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Moon size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                              Display & accessibility
                            </button>
                            
                            <button 
                              onClick={() => {
                                // Handle feedback
                                setShowProfileMenu(false);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <MessageCircle size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                              Give feedback
                            </button>
                            
                            <button 
                              onClick={() => {
                                logout();
                                setShowProfileMenu(false);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <LogOut size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                              Log Out
                            </button>
                          </div>
                          </>) : (<>
                          <div>
                            <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center">
                              <button 
                                onClick={() => setShowDarkModePanel(false)}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mr-2"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Display & accessibility</h3>
                            </div>
                            
                            <div className="p-3">
                              <div className="flex items-center mb-2">
                                <div className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full mr-2">
                                  <Moon size={14} className="text-gray-600 dark:text-gray-300" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white text-xs">Dark mode</h4>
                                </div>
                              </div>
                              
                              <div className="space-y-2 mt-2">
                                <div 
                                  className="flex items-center justify-between py-1 cursor-pointer"
                                  onClick={() => {
                                    setMode('light');
                                  }}
                                >
                                  <span className="text-gray-700 dark:text-gray-300 text-xs">Off</span>
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${useTheme().mode === 'light' ? 'border-blue-500' : 'border-gray-400 dark:border-gray-600'}`}>
                                    {useTheme().mode === 'light' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                  </div>
                                </div>
                                
                                <div 
                                  className="flex items-center justify-between py-1 cursor-pointer"
                                  onClick={() => {
                                    setMode('dark');
                                  }}
                                >
                                  <span className="text-gray-700 dark:text-gray-300 text-xs">On</span>
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${useTheme().mode === 'dark' ? 'border-blue-500' : 'border-gray-400 dark:border-gray-600'}`}>
                                    {useTheme().mode === 'dark' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                  </div>
                                </div>
                                
                                <div 
                                  className="flex items-center justify-between py-1 cursor-pointer"
                                  onClick={() => {
                                    setMode('system');
                                  }}
                                >
                                  <span className="text-gray-700 dark:text-gray-300 text-xs">Automatic</span>
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${useTheme().mode === 'system' ? 'border-blue-500' : 'border-gray-400 dark:border-gray-600'}`}>
                                    {useTheme().mode === 'system' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          </>)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">{user.name}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.universityId}</div>
                  </div>
                  
                  {/* Profile menu that appears when clicking profile image */}
                  <AnimatePresence>
                  {showProfileMenu && (
                      <motion.div 
                        ref={profileMenuRef}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden z-50"
                      >
                        {!showDarkModePanel ? (<>
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-center">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-blue-100 dark:border-blue-700"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">{user.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{user.universityId}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              onNavigate('profile');
                              setShowProfileMenu(false);
                              setIsMenuOpen(false);
                            }}
                            className="mt-3 w-full text-center text-sm text-blue-800 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                          >
                            See all profiles
                          </button>
                        </div>
                        
                        <div className="py-1">
                          <button 
                            onClick={() => {
                              // Handle settings
                              setShowProfileMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Settings size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                            Settings & privacy
                          </button>
                          
                          <button 
                            onClick={() => {
                              // Handle help
                              setShowProfileMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <HelpCircle size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                            Help & support
                          </button>
                          
                          <button 
                            onClick={() => {
                              setShowDarkModePanel(true);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Moon size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                            Display & accessibility
                          </button>
                          
                          <button 
                            onClick={() => {
                              // Handle feedback
                              setShowProfileMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <MessageCircle size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                            Give feedback
                          </button>
                          
                          <button 
                            onClick={() => {
                              logout();
                              setShowProfileMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <LogOut size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                            Log Out
                          </button>
                        </div>
                        </>) : (<>
                        <div>
                          <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center">
                            <button 
                              onClick={() => setShowDarkModePanel(false)}
                              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mr-2"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Display & accessibility</h3>
                          </div>
                          
                          <div className="p-3">
                            <div className="flex items-center mb-2">
                              <div className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full mr-2">
                                <Moon size={14} className="text-gray-600 dark:text-gray-300" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white text-xs">Dark mode</h4>
                              </div>
                            </div>
                            
                            <div className="space-y-2 mt-2">
                              <div 
                                className="flex items-center justify-between py-1 cursor-pointer"
                                onClick={() => {
                                  setMode('light');
                                }}
                              >
                                <span className="text-gray-700 dark:text-gray-300 text-xs">Off</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${useTheme().mode === 'light' ? 'border-blue-500' : 'border-gray-400 dark:border-gray-600'}`}>
                                  {useTheme().mode === 'light' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                </div>
                              </div>
                              
                              <div 
                                className="flex items-center justify-between py-1 cursor-pointer"
                                onClick={() => {
                                  setMode('dark');
                                }}
                              >
                                <span className="text-gray-700 dark:text-gray-300 text-xs">On</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${useTheme().mode === 'dark' ? 'border-blue-500' : 'border-gray-400 dark:border-gray-600'}`}>
                                  {useTheme().mode === 'dark' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                </div>
                              </div>
                              
                              <div 
                                className="flex items-center justify-between py-1 cursor-pointer"
                                onClick={() => {
                                  setMode('system');
                                }}
                              >
                                <span className="text-gray-700 dark:text-gray-300 text-xs">Automatic</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${useTheme().mode === 'system' ? 'border-blue-500' : 'border-gray-400 dark:border-gray-600'}`}>
                                  {useTheme().mode === 'system' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        </>)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
