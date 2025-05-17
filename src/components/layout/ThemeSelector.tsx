import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronLeft } from 'lucide-react';

type ThemeOption = 'light' | 'dark' | 'system';

interface ThemeSelectorProps {
  onClose: () => void;
  showBackButton?: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onClose, showBackButton = true }) => {
  const { mode, setMode } = useTheme();

  const handleSelectTheme = (selectedMode: ThemeOption) => {
    setMode(selectedMode);
    onClose();
  };

  return (
    <div className="p-4">
      {showBackButton && (
        <div className="flex items-center mb-4">
          <button 
            onClick={onClose}
            className="mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Display & accessibility</h3>
        </div>
      )}
      
      <div className="space-y-3">
        <button 
          onClick={() => handleSelectTheme('light')}
          className={`flex items-center w-full px-3 py-2 text-sm ${
            mode === 'light' 
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          } rounded-lg`}
        >
          <div className={`w-8 h-8 rounded-full ${
            mode === 'light' 
              ? 'bg-blue-100 dark:bg-blue-800' 
              : 'bg-gray-100'
          } flex items-center justify-center mr-3`}>
            <span className="text-yellow-500">☀️</span>
          </div>
          <div className="flex-1">Light mode</div>
          {mode === 'light' && (
            <div className="ml-auto w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </button>
        
        <button 
          onClick={() => handleSelectTheme('dark')}
          className={`flex items-center w-full px-3 py-2 text-sm ${
            mode === 'dark' 
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          } rounded-lg`}
        >
          <div className={`w-8 h-8 rounded-full ${
            mode === 'dark' 
              ? 'bg-blue-100 dark:bg-blue-800' 
              : 'bg-gray-800'
          } flex items-center justify-center mr-3`}>
            <span>🌙</span>
          </div>
          <div className="flex-1">Dark mode</div>
          {mode === 'dark' && (
            <div className="ml-auto w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </button>
        
        <button 
          onClick={() => handleSelectTheme('system')}
          className={`flex items-center w-full px-3 py-2 text-sm ${
            mode === 'system' 
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          } rounded-lg`}
        >
          <div className={`w-8 h-8 rounded-full ${
            mode === 'system' 
              ? 'bg-blue-100 dark:bg-blue-800' 
              : 'bg-gradient-to-r from-gray-100 to-gray-800'
          } flex items-center justify-center mr-3`}>
            <span>⚙️</span>
          </div>
          <div className="flex-1">System default</div>
          {mode === 'system' && (
            <div className="ml-auto w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default ThemeSelector;
