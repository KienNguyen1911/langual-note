'use client';

import React from 'react';

interface DotPatternBackgroundProps {
  children: React.ReactNode;
}

export default function DotPatternBackground({ children }: DotPatternBackgroundProps) {
  return (
    <div className="relative min-h-screen w-full">
      {/* Dot pattern background */}
      <div 
        className="absolute inset-0 z-0 bg-white dark:bg-[#121212] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)
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