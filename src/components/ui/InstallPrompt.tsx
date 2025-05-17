import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import Button from './Button';

// Interface for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if it's an iOS device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOSDevice(isIOS);
    
    // Don't show the prompt if the app is already installed
    if (isAppInstalled) {
      return;
    }

    // For non-iOS devices, listen for the beforeinstallprompt event
    if (!isIOS) {
      const handleBeforeInstallPrompt = (e: Event) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Store the event so it can be triggered later
        setInstallPromptEvent(e as BeforeInstallPromptEvent);
        // Show our custom install prompt
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Clean up the event listener
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    } else {
      // For iOS devices, show the iOS-specific prompt after a delay
      const timer = setTimeout(() => {
        // Only show if the user hasn't seen it in this session
        const hasSeenIOSPrompt = sessionStorage.getItem('hasSeenIOSPrompt');
        if (!hasSeenIOSPrompt) {
          setShowPrompt(true);
          sessionStorage.setItem('hasSeenIOSPrompt', 'true');
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;
    
    // Show the install prompt
    await installPromptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPromptEvent.userChoice;
    
    // User accepted the install prompt
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the saved prompt since it can't be used again
    setInstallPromptEvent(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember that the user dismissed the prompt for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <img src="/icons/icon-72x72.png" alt="InCampus" className="w-10 h-10 mr-2 rounded-lg" />
          <h3 className="font-bold text-gray-900 dark:text-white">Install InCampus</h3>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        {isIOSDevice 
          ? 'Add InCampus to your home screen for a better experience! Tap the share button and then "Add to Home Screen".' 
          : 'Install InCampus on your device for a better experience, even when offline!'}
      </p>
      
      {!isIOSDevice ? (
        <Button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-center"
          variant="primary"
          size="sm"
        >
          <Download size={16} className="mr-2" />
          Install App
        </Button>
      ) : (
        <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
          <span className="mr-2">Tap</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
          <span className="ml-2">then "Add to Home Screen"</span>
        </div>
      )}
    </div>
  );
};

export default InstallPrompt;
