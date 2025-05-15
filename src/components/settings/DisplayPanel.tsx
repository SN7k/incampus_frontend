import React from 'react';
import { ChevronLeft, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

interface DisplayPanelProps {
  onClose: () => void;
}

const DisplayPanel: React.FC<DisplayPanelProps> = ({ onClose }) => {
  const { mode, setMode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 300 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 300 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end"
      onClick={(e) => {
        // Close when clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div 
        className="bg-gray-900 text-white rounded-t-xl overflow-hidden"
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-800 flex items-center">
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white mr-3"
          >
            <ChevronLeft size={24} />
          </button>
          <h3 className="text-xl font-semibold text-white">Display & accessibility</h3>
        </div>
        
        <div className="p-5">
          <div className="flex items-center mb-3">
            <div className="bg-gray-800 p-2 rounded-full mr-3">
              <Moon size={20} className="text-gray-300" />
            </div>
            <div>
              <h4 className="font-medium text-white">Dark mode</h4>
              <p className="text-sm text-gray-400">
                Adjust the appearance of Unipix to reduce glare and give your eyes a break.
              </p>
            </div>
          </div>
          
          <div className="space-y-4 mt-4">
            <div 
              className="flex items-center justify-between py-2"
              onClick={() => setMode('light')}
            >
              <span className="text-gray-300">Off</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${mode === 'light' ? 'border-blue-500' : 'border-gray-600'}`}>
                {mode === 'light' && <div className="w-4 h-4 bg-blue-500 rounded-full"></div>}
              </div>
            </div>
            
            <div 
              className="flex items-center justify-between py-2"
              onClick={() => setMode('dark')}
            >
              <span className="text-gray-300">On</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${mode === 'dark' ? 'border-blue-500' : 'border-gray-600'}`}>
                {mode === 'dark' && <div className="w-4 h-4 bg-blue-500 rounded-full"></div>}
              </div>
            </div>
            
            <div 
              className="flex items-center justify-between py-2"
              onClick={() => setMode('system')}
            >
              <div>
                <span className="text-gray-300">Automatic</span>
                <p className="text-xs text-gray-500">
                  We'll automatically adjust the display based on your device's system settings.
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${mode === 'system' ? 'border-blue-500' : 'border-gray-600'}`}>
                {mode === 'system' && <div className="w-4 h-4 bg-blue-500 rounded-full"></div>}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DisplayPanel;
