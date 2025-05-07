import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import '../styles/animations.css';

type AnimatedCardProps = {
  children: React.ReactNode;
  isVisible: boolean;
  delay?: number; // Delay index for staggered animations
  className?: string;
};

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  isVisible,
  delay = 0,
  className,
}) => {
  // State to track if the card should be rendered at all
  const [shouldRender, setShouldRender] = useState(isVisible);

  // Handle visibility changes
  useEffect(() => {
    if (isVisible) {
      // If becoming visible, render immediately
      setShouldRender(true);
    } else {
      // If becoming invisible, wait for animation to complete before removing from DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500); // Match this with the animation duration
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Don't render anything if the card shouldn't be rendered
  if (!shouldRender && !isVisible) {
    return null;
  }

  // Determine animation classes
  const animationClass = isVisible ? 'funnel-in' : 'funnel-out';
  const delayClass = delay > 0 ? `funnel-delay-${delay}` : '';

  return (
    <div
      className={cn(
        'animation-container',
        animationClass,
        delayClass,
        className
      )}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;