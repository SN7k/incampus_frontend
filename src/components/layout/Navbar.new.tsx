import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, Menu, X, Bell, MessageSquare, Home, Users, BookOpen, LogOut, ChevronDown, Sun, Moon, Settings, HelpCircle, UserCircle, Image, Shield } from 'lucide-react';
import Button from '../ui/Button';
import { getAvatarUrl } from '../../utils/avatarUtils';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, setThemeMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Add loading state check
  if (!user) {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && window.innerWidth < 768) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Close dropdown if opening menu on mobile
    if (!isMenuOpen) {
      setIsDropdownOpen(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    // Close menu if opening dropdown on mobile
    if (!isDropdownOpen && window.innerWidth < 768) {
      setIsMenuOpen(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
  };

  const toggleDarkMode = () => {
    setThemeMode(isDarkMode ? 'light' : 'dark');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50 py-2 fixed top-0 left-0 right-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-2 rounded-lg mr-2">
                <BookOpen size={24} />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-400 dark:to-blue-300">
                InCampus
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block flex-1 mx-8">
            <div className="flex items-center justify-between">
              {/* Search bar */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
                <input
                  type="text"
                  placeholder="Search InCampus..."
                  className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500">
                  <Search size={18} />
                </div>
              </form>

              {/* Navigation items */}
              <div className="flex items-center space-x-6 ml-6">
                <Button variant="ghost" className="p-2 rounded-full">
                  <Home size={20} />
                </Button>
                <Button variant="ghost" className="p-2 rounded-full">
                  <MessageSquare size={20} />
                </Button>
                <Button variant="ghost" className="p-2 rounded-full relative">
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                    3
                  </span>
                </Button>

                {/* Theme toggle */}
                <Button
                  variant="ghost"
                  className="p-2 rounded-full"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </Button>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <img
                      src={getAvatarUrl(user?.avatar, user?.name || 'User')}
                      alt={user?.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800"
                    />
                    <span className="font-medium text-gray-800 dark:text-gray-200">{user.name}</span>
                    <ChevronDown size={16} className={`text-gray-600 dark:text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Facebook-style dropdown menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 border border-gray-100 dark:border-gray-700 overflow-hidden">
                      {/* User profile section */}
                      <div className="p-2">
                        <a href="#" className="block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center">
                            <img 
                              src={getAvatarUrl(user?.avatar, user?.name || 'User')} 
                              alt={user?.name || 'User'} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="ml-3">
                              <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">View your profile</p>
                            </div>
                          </div>
                        </a>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700"></div>
                      
                      {/* Main menu items */}
                      <div className="p-2">
                        <a href="#" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                            <UserCircle size={20} className="text-gray-700 dark:text-gray-300" />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Profile</span>
                        </a>
                        
                        <a href="#" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                            <Users size={20} className="text-gray-700 dark:text-gray-300" />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Friends</span>
                        </a>
                        
                        <a href="#" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                            <Image size={20} className="text-gray-700 dark:text-gray-300" />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Photos</span>
                        </a>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700"></div>
                      
                      {/* Settings and support */}
                      <div className="p-2">
                        <a href="#" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                              <Settings size={20} className="text-gray-700 dark:text-gray-300" />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Settings & privacy</span>
                          </div>
                          <ChevronDown size={16} className="text-gray-500" />
                        </a>
                        
                        <a href="#" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                              <HelpCircle size={20} className="text-gray-700 dark:text-gray-300" />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Help & support</span>
                          </div>
                          <ChevronDown size={16} className="text-gray-500" />
                        </a>
                        
                        <a href="#" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                              <Shield size={20} className="text-gray-700 dark:text-gray-300" />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Display & accessibility</span>
                          </div>
                          <ChevronDown size={16} className="text-gray-500" />
                        </a>
                        
                        <button
                          onClick={logout}
                          className="w-full flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                            <LogOut size={20} className="text-gray-700 dark:text-gray-300" />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Log Out</span>
                        </button>
                      </div>
                      
                      {/* Footer */}
                      <div className="p-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap gap-x-2">
                          <a href="#" className="hover:underline">Privacy</a>
                          <span>·</span>
                          <a href="#" className="hover:underline">Terms</a>
                          <span>·</span>
                          <a href="#" className="hover:underline">Advertising</a>
                          <span>·</span>
                          <a href="#" className="hover:underline">Cookies</a>
                        </div>
                        <div className="mt-1">InCampus © {new Date().getFullYear()}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              className="p-2 rounded-full"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            <button
              onClick={toggleMenu}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-800 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded-md"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg" ref={mobileMenuRef}>
          <div className="px-4 pt-2 pb-4">
            {/* User info - Facebook style */}
            <a href="#" className="flex items-center space-x-3 py-3 border-b border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2">
              <img
                src={getAvatarUrl(user?.avatar, user?.name || 'User')}
                alt={user?.name || 'User'}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">View your profile</div>
              </div>
            </a>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative my-4">
              <input
                type="text"
                placeholder="Search InCampus..."
                className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500">
                <Search size={18} />
              </div>
            </form>

            {/* Navigation links - Facebook style */}
            <div className="space-y-1 mt-2">
              <a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-800 dark:hover:text-blue-400">
                <Home size={20} className="mr-3" />
                Home
              </a>
              <a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-800 dark:hover:text-blue-400">
                <UserCircle size={20} className="mr-3" />
                Profile
              </a>
              <a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-800 dark:hover:text-blue-400">
                <Users size={20} className="mr-3" />
                Friends
              </a>
              <a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-800 dark:hover:text-blue-400">
                <MessageSquare size={20} className="mr-3" />
                Messages
              </a>
              <a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-800 dark:hover:text-blue-400">
                <Bell size={20} className="mr-3" />
                Notifications
                <span className="ml-auto inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                  3
                </span>
              </a>
              <a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-800 dark:hover:text-blue-400">
                <Image size={20} className="mr-3" />
                Photos
              </a>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              
              <a href="#" className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-800 dark:hover:text-blue-400">
                <div className="flex items-center">
                  <Settings size={20} className="mr-3" />
                  Settings & privacy
                </div>
                <ChevronDown size={16} />
              </a>
              <a href="#" className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-800 dark:hover:text-blue-400">
                <div className="flex items-center">
                  <HelpCircle size={20} className="mr-3" />
                  Help & support
                </div>
                <ChevronDown size={16} />
              </a>
              <a href="#" className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-800 dark:hover:text-blue-400">
                <div className="flex items-center">
                  <Shield size={20} className="mr-3" />
                  Display & accessibility
                </div>
                <ChevronDown size={16} />
              </a>
              
              <button
                onClick={logout}
                className="w-full flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-800 dark:hover:text-blue-400"
              >
                <LogOut size={20} className="mr-3" />
                Log Out
              </button>
            </div>
            
            {/* Footer for mobile */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex flex-wrap gap-x-2">
                <a href="#" className="hover:underline">Privacy</a>
                <span>·</span>
                <a href="#" className="hover:underline">Terms</a>
                <span>·</span>
                <a href="#" className="hover:underline">Cookies</a>
              </div>
              <div className="mt-1">InCampus © {new Date().getFullYear()}</div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
