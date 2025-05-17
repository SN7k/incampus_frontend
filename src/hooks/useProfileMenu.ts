import { useState } from 'react';

export function useProfileMenu() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDarkModePanel, setShowDarkModePanel] = useState(false);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    // If we're closing the profile menu, also close the dark mode panel
    if (showProfileMenu) {
      setShowDarkModePanel(false);
    }
  };

  const openDarkModePanel = () => {
    setShowDarkModePanel(true);
    // Ensure the profile menu is open when showing dark mode panel
    setShowProfileMenu(true);
  };

  const closeDarkModePanel = () => {
    setShowDarkModePanel(false);
  };

  const closeProfileMenu = () => {
    setShowProfileMenu(false);
    setShowDarkModePanel(false);
  };

  return {
    showProfileMenu,
    showDarkModePanel,
    toggleProfileMenu,
    openDarkModePanel,
    closeDarkModePanel,
    closeProfileMenu
  };
}
