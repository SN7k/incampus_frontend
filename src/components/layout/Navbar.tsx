import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSearch } from '../../contexts/SearchContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Search, Bell, Home, LogOut, Settings, HelpCircle, Shield, ChevronRight, Users, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';
import SearchModal from '../search/SearchModal';
import NotificationPanel from '../notification/NotificationPanel';
import { getAvatarUrl } from '../../utils/avatarUtils';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const { unreadCount, showNotificationPanel, setShowNotificationPanel } = useNotifications();
  // State for dropdown and submenu management
  const [_] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDisplaySubmenu, setShowDisplaySubmenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const searchModalRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Use the search context - we don't need any methods here as the SearchModal handles everything
  const { } = useSearch();
  
  // State for friend requests notification
  const [hasFriendRequests, setHasFriendRequests] = useState(false);

  // Navigation functions to different pages
  const navigateToProfile = () => {
    // Close the dropdown menu
    setIsDropdownOpen(false);
    
    // Clear any stored profile ID to ensure we show the user's own profile
    localStorage.removeItem('viewProfileUserId');
    
    // Use window object to trigger a custom event that App.tsx can listen for
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'profile' } }));
  };
  
  const navigateToFeed = () => {
    // Close any open menus
    setIsDropdownOpen(false);
    
    // Navigate to feed page
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'feed' } }));
  };
  
  const navigateToFriends = () => {
    // Close any open menus
    setIsDropdownOpen(false);
    
    // Navigate to friends page
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'friends' } }));
  };
  
  const navigateToSettings = () => {
    // Close any open menus
    setIsDropdownOpen(false);
    
    // Store the current page before navigating to settings
    const currentPage = localStorage.getItem('currentPage') || 'feed';
    localStorage.setItem('previousPage', currentPage);
    
    // Navigate to settings page
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'settings' } }));
  };
  
  // Listen for friend requests changes
  useEffect(() => {
    const handleFriendRequestsChange = (event: CustomEvent) => {
      setHasFriendRequests(event.detail.hasRequests);
    };
    
    window.addEventListener('friendRequestsChange', handleFriendRequestsChange as EventListener);
    
    return () => {
      window.removeEventListener('friendRequestsChange', handleFriendRequestsChange as EventListener);
    };
  }, []);
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown and search modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close dropdown when clicking outside
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setShowDisplaySubmenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);
  
  // Separate effect for search modal to prevent input issues
  useEffect(() => {
    const handleSearchModalClickOutside = (event: MouseEvent) => {
      // Only close if clicking on the overlay (background) but not on the modal itself
      if (
        isSearchModalOpen &&
        searchModalRef.current &&
        !searchModalRef.current.contains(event.target as Node) &&
        (event.target as HTMLElement).classList.contains('search-modal-overlay')
      ) {
        setIsSearchModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleSearchModalClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleSearchModalClickOutside);
    };
  }, [isSearchModalOpen]);
  
  // Close search modal when navigating to a different page
  useEffect(() => {
    const handleNavigation = () => {
      if (isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };
    
    // Listen for both navigation events and direct page changes
    window.addEventListener('navigate', handleNavigation);
    window.addEventListener('pageChange', handleNavigation);
    
    return () => {
      window.removeEventListener('navigate', handleNavigation);
      window.removeEventListener('pageChange', handleNavigation);
    };
  }, [isSearchModalOpen]);

  // Function to open search modal
  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span 
                className="text-xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                onClick={navigateToFeed}
              >
                InCampus
              </span>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <button 
                onClick={navigateToFeed}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
              >
                <Home className="h-5 w-5 mr-1" />
                <span>Home</span>
              </button>
              <button 
                onClick={navigateToFriends}
                className={`px-3 py-2 rounded-md text-sm font-medium ${hasFriendRequests ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'} hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center`}
              >
                <Users className="h-5 w-5 mr-1" />
                <span>Friends</span>
              </button>

            </div>
          </div>
          
          {/* Search, notifications, profile */}
          <div className="flex items-center">
            {/* Search - Desktop */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search..."
                      onClick={openSearchModal}
                      readOnly
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-gray-50 dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Search - Mobile */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                className="p-2 rounded-full"
                onClick={openSearchModal}
              >
                <Search size={20} className="text-gray-500 dark:text-gray-400" />
              </Button>
            </div>
            
            {/* Notifications */}
            <div className="ml-2 md:ml-4 relative" ref={notificationRef}>
              <Button
                variant="ghost"
                className={`p-2 rounded-full relative ${unreadCount > 0 ? 'animate-pulse' : ''}`}
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
              >
                <Bell 
                  size={20} 
                  className={`${unreadCount > 0 ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} 
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
              
              {/* Notification Panel */}
              <div className="absolute right-0 z-50">
                <NotificationPanel />
              </div>
            </div>
            
            {/* Profile dropdown */}
            <div className="ml-3 relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setShowDisplaySubmenu(false);
                }}
                className="flex items-center focus:outline-none"
              >
                <img
                  src={getAvatarUrl(user?.avatar, user?.name || 'User')}
                  alt={user?.name || "User"}
                  className="w-11 h-11 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800 cursor-pointer transition-transform active:scale-95 hover:border-blue-400 dark:hover:border-blue-600 shadow-md"
                />
              </button>
              
              {/* Desktop dropdown */}
              {isDropdownOpen && !isMobile && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-xl bg-white dark:bg-gray-800 z-50 border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {!showDisplaySubmenu ? (
                    <>
                      {/* User profile section */}
                      <div className="p-3">
                        <button onClick={navigateToProfile} className="w-full text-left block p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center">
                            <img 
                              src={getAvatarUrl(user?.avatar, user?.name || 'User')} 
                              alt={user?.name || "User"} 
                              className="w-12 h-12 rounded-full object-cover shadow-sm"
                            />
                            <div className="ml-3">
                              <p className="font-medium text-base text-gray-900 dark:text-gray-100">{user?.name || "User"}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">View your profile</p>
                            </div>
                          </div>
                        </button>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700"></div>
                      
                      {/* Settings and support */}
                      <div className="p-2">
                        <button onClick={navigateToSettings} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                              <Settings size={18} className="text-gray-700 dark:text-gray-300" />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Settings & privacy</span>
                          </div>
                          <ChevronRight size={14} className="text-gray-500" />
                        </button>
                        
                        <a 
                          href="mailto:connect.incampus@gmail.com?subject=InCampus%20Support%20Request&body=Hello%20InCampus%20Support%20Team,%0A%0AI%20need%20assistance%20with%20the%20following%20issue:%0A%0A[Please%20describe%20your%20issue%20here]%0A%0AThank%20you,%0A[Your%20Name]" 
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                              <HelpCircle size={18} className="text-gray-700 dark:text-gray-300" />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Help & support</span>
                          </div>
                          <ChevronRight size={14} className="text-gray-500" />
                        </a>
                        
                        <button 
                          onClick={() => setShowDisplaySubmenu(true)}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                              <Shield size={18} className="text-gray-700 dark:text-gray-300" />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Display & accessibility</span>
                          </div>
                          <ChevronRight size={14} className="text-gray-500" />
                        </button>
                        
                        <button 
                          onClick={logout}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                              <LogOut size={18} className="text-gray-700 dark:text-gray-300" />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Log Out</span>
                          </div>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-1.5 border-b border-gray-200 dark:border-gray-700">
                        <button 
                          onClick={() => setShowDisplaySubmenu(false)}
                          className="flex items-center p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ChevronRight size={12} className="text-gray-500 transform rotate-180 mr-2" />
                          <span className="font-medium text-xs text-gray-900 dark:text-gray-100">Display & accessibility</span>
                        </button>
                      </div>
                      
                      <div className="p-2">
                        <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-2">Dark mode</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Adjust the appearance of InCampus to reduce glare.</p>
                        
                        <div className="space-y-1.5">
                          <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                            <span className="text-xs text-gray-700 dark:text-gray-300">Off</span>
                            <input 
                              type="radio" 
                              name="darkMode" 
                              checked={themeMode === 'light'} 
                              onChange={() => setThemeMode('light')} 
                              className="form-radio h-3 w-3 text-blue-600 transition duration-150 ease-in-out"
                            />
                          </label>
                          
                          <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                            <span className="text-xs text-gray-700 dark:text-gray-300">On</span>
                            <input 
                              type="radio" 
                              name="darkMode" 
                              checked={themeMode === 'dark'} 
                              onChange={() => setThemeMode('dark')} 
                              className="form-radio h-3 w-3 text-blue-600 transition duration-150 ease-in-out"
                            />
                          </label>
                          
                          <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-700 dark:text-gray-300">Automatic</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 text-[10px]">Use device settings</span>
                            </div>
                            <input 
                              type="radio" 
                              name="darkMode" 
                              checked={themeMode === 'auto'} 
                              onChange={() => setThemeMode('auto')} 
                              className="form-radio h-3 w-3 text-blue-600 transition duration-150 ease-in-out"
                            />
                          </label>
                        </div>
                        

                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dropdown - optimized for mobile */}
      {isDropdownOpen && isMobile && !showDisplaySubmenu && (
        <div className="md:hidden fixed top-16 right-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-100 dark:border-gray-700 overflow-hidden" ref={mobileMenuRef}>
          {/* User profile section */}
          <div className="p-3">
            <button onClick={navigateToProfile} className="w-full text-left block p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <img 
                  src={getAvatarUrl(user?.avatar, user?.name || 'User')} 
                  alt={user?.name || "User"} 
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                />
                <div className="ml-3">
                  <p className="font-medium text-base text-gray-900 dark:text-gray-100">{user?.name || "User"}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">View your profile</p>
                </div>
              </div>
            </button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
          
          {/* Settings and support */}
          <div className="p-1.5">
            <button onClick={navigateToSettings} className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                  <Settings size={16} className="text-gray-700 dark:text-gray-300" />
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Settings & privacy</span>
              </div>
              <ChevronRight size={12} className="text-gray-500" />
            </button>
            
            <a 
              href="mailto:connect.incampus@gmail.com?subject=InCampus%20Support%20Request&body=Hello%20InCampus%20Support%20Team,%0A%0AI%20need%20assistance%20with%20the%20following%20issue:%0A%0A[Please%20describe%20your%20issue%20here]%0A%0AThank%20you,%0A[Your%20Name]" 
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                  <HelpCircle size={16} className="text-gray-700 dark:text-gray-300" />
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Help & support</span>
              </div>
              <ChevronRight size={12} className="text-gray-500" />
            </a>
            
            <button 
              onClick={() => setShowDisplaySubmenu(true)}
              className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                  <Shield size={16} className="text-gray-700 dark:text-gray-300" />
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Display & accessibility</span>
              </div>
              <ChevronRight size={12} className="text-gray-500" />
            </button>
            
            <button 
              onClick={logout}
              className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                  <LogOut size={16} className="text-gray-700 dark:text-gray-300" />
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Log Out</span>
              </div>
            </button>
          </div>
        </div>
      )}
      
      {/* Mobile Display & accessibility submenu */}
      {isDropdownOpen && isMobile && showDisplaySubmenu && (
        <div className="md:hidden fixed top-16 right-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-100 dark:border-gray-700 overflow-hidden" ref={mobileMenuRef}>
          <div className="p-1.5 border-b border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setShowDisplaySubmenu(false)}
              className="flex items-center p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight size={12} className="text-gray-500 transform rotate-180 mr-2" />
              <span className="font-medium text-xs text-gray-900 dark:text-gray-100">Display & accessibility</span>
            </button>
          </div>
          
          <div className="p-2">
            <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-2">Dark mode</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Adjust the appearance of InCampus to reduce glare.</p>
            
            <div className="space-y-1.5">
              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <span className="text-xs text-gray-700 dark:text-gray-300">Off</span>
                <input 
                  type="radio" 
                  name="darkMode" 
                  checked={themeMode === 'light'} 
                  onChange={() => setThemeMode('light')} 
                  className="form-radio h-3 w-3 text-blue-600 transition duration-150 ease-in-out"
                />
              </label>
              
              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <span className="text-xs text-gray-700 dark:text-gray-300">On</span>
                <input 
                  type="radio" 
                  name="darkMode" 
                  checked={themeMode === 'dark'} 
                  onChange={() => setThemeMode('dark')} 
                  className="form-radio h-3 w-3 text-blue-600 transition duration-150 ease-in-out"
                />
              </label>
              
              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-700 dark:text-gray-300">Automatic</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-[10px]">Use device settings</span>
                </div>
                <input 
                  type="radio" 
                  name="darkMode" 
                  checked={themeMode === 'auto'} 
                  onChange={() => setThemeMode('auto')} 
                  className="form-radio h-3 w-3 text-blue-600 transition duration-150 ease-in-out"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal (works for both mobile and desktop) */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
        isMobile={window.innerWidth < 768}
      />
    </nav>
  );
};

export default Navbar;
