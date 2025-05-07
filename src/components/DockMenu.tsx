import React from 'react';
import { cn } from '@/lib/utils';
import { useDockMenu } from './DockMenuProvider';

// Define the types for our component props
type DockMenuProps = {
  className?: string;
};

// Define the function cards configuration
const FUNCTION_CARDS = [
  { id: 'vocabulary', label: 'Vocabulary Note' },
  { id: 'translation', label: 'Translation' },
  { id: 'history', label: 'Translation History' },
  { id: 'video', label: 'Video Player' },
];

const DockMenu: React.FC<DockMenuProps> = ({ className }) => {
  // Use the dock menu context
  const { visibleCards, toggleCardVisibility } = useDockMenu();

  return (
    <div className={cn('fixed left-4 top-1/2 transform -translate-y-1/2 z-50', className)}>
      <div className="bg-card border rounded-lg shadow-lg px-3 py-6 flex flex-col items-center space-y-4">
        {FUNCTION_CARDS.map((card) => (
          <button
            key={card.id}
            onClick={() => toggleCardVisibility(card.id)}
            className={cn(
              'rounded-full p-2 transition-all duration-300 ease-in-out',
              visibleCards[card.id as keyof typeof visibleCards] 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
            title={`${visibleCards[card.id as keyof typeof visibleCards] ? 'Hide' : 'Show'} ${card.label}`}
          >
            {/* Icon representation based on card type */}
            {card.id === 'vocabulary' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            )}
            {card.id === 'translation' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-languages"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
            )}
            {card.id === 'history' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-history"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
            )}
            {card.id === 'video' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DockMenu;
