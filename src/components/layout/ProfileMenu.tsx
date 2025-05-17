import React from 'react';
import { motion } from 'framer-motion';
import { Settings, HelpCircle, Moon, MessageCircle, LogOut } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import { useProfileMenu } from '../../hooks/useProfileMenu';
import { User } from '../../types';

interface ProfileMenuProps {
  user: User;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ 
  user, 
  onNavigateToProfile,
  onLogout
}) => {
  const { 
    showProfileMenu, 
    showDarkModePanel, 
    toggleProfileMenu,
    openDarkModePanel,
    closeDarkModePanel,
    closeProfileMenu
  } = useProfileMenu();

  return (
    <div className="relative">
      <button 
        onClick={toggleProfileMenu}
        className="flex items-center focus:outline-none"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer"
          data-component-name="Navbar"
        />
      </button>
      
      {showProfileMenu && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden z-50"
        >
          {!showDarkModePanel ? (
            <>
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
                    onNavigateToProfile();
                    closeProfileMenu();
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
                    closeProfileMenu();
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                  Settings & privacy
                </button>
                
                <button 
                  onClick={() => {
                    // Handle help
                    closeProfileMenu();
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <HelpCircle size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                  Help & support
                </button>
                
                <button 
                  onClick={openDarkModePanel}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Moon size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                  Display & accessibility
                </button>
                
                <button 
                  onClick={() => {
                    // Handle feedback
                    closeProfileMenu();
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <MessageCircle size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                  Give feedback
                </button>
                
                <button 
                  onClick={() => {
                    onLogout();
                    closeProfileMenu();
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <ThemeSelector onClose={closeDarkModePanel} />
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ProfileMenu;
