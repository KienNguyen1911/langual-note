import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of our context
type DockMenuContextType = {
  visibleCards: {
    vocabulary: boolean;
    translation: boolean;
    history: boolean;
    video: boolean;
  };
  toggleCardVisibility: (cardId: string) => void;
};

// Create the context with a default value
const DockMenuContext = createContext<DockMenuContextType | undefined>(undefined);

// Define the props for our provider component
type DockMenuProviderProps = {
  children: ReactNode;
};

// Create the provider component
export const DockMenuProvider: React.FC<DockMenuProviderProps> = ({ children }) => {
  // State to track which cards are visible
  const [visibleCards, setVisibleCards] = useState({
    vocabulary: true,
    translation: true,
    history: true,
    video: true,
  });

  // Function to toggle a card's visibility
  const toggleCardVisibility = (cardId: string) => {
    setVisibleCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId as keyof typeof prev],
    }));
  };

  // Value to be provided to consumers
  const value = {
    visibleCards,
    toggleCardVisibility,
  };

  return (
    <DockMenuContext.Provider value={value}>
      {children}
    </DockMenuContext.Provider>
  );
};

// Custom hook to use the dock menu context
export const useDockMenu = (): DockMenuContextType => {
  const context = useContext(DockMenuContext);
  if (context === undefined) {
    throw new Error('useDockMenu must be used within a DockMenuProvider');
  }
  return context;
};