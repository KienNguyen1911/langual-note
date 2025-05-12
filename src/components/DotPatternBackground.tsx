'use client';

import React, { useEffect, useState } from 'react';

interface DotPatternBackgroundProps {
  children: React.ReactNode;
}

export default function DotPatternBackground({ children }: DotPatternBackgroundProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    // Listen for changes in the color scheme
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);

    // Also check for Tailwind's dark class on the document
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      {/* Dot pattern background */}
      <div 
        className="absolute inset-0 z-0 bg-white dark:bg-[#121212] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, ${isDarkMode ? 'rgba(66,66,66,0.7)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
