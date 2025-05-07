'use client';

import { useState } from 'react';
import VocabularyNote from '@/components/VocabularyNote';
import Translation from '@/components/Translation';
import TranslationHistory from '@/components/TranslationHistory';
import VideoPlayer from '@/components/VideoPlayer';
import AuthButton from '@/components/AuthButton';
import ThemeToggle from '@/components/ThemeToggle';
import DotPatternBackground from '@/components/DotPatternBackground';

export default function Home() {
  return (
    <DotPatternBackground>
      <div className="min-h-screen py-4 md:py-8">
        <header className="max-w-7xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-foreground">Language Learning Hub</h1>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <AuthButton />
            </div>
          </div>
          <p className="text-muted-foreground">
            Learn languages effectively with vocabulary notes, translation, history tracking, and video content with picture-in-picture support
          </p>
        </header>

        <main className="max-w mx-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* First column */}
            <div className="space-y-6">
              <VocabularyNote />
            </div>

            {/* Second column */}
            <div className="space-y-6">
              <Translation />
            </div>

            {/* Third column */}
            <div className="space-y-6">
              <TranslationHistory />
            </div>

            {/* Fourth column - Video Player with Picture-in-Picture */}
            <div className="space-y-6">
              <VideoPlayer />
            </div>
          </div>
        </main>

        <footer className="max-w-7xl mx-auto mt-12 text-center text-sm text-muted-foreground">
          <p>Language Learning Hub - A simple application to help you learn languages</p>
        </footer>
      </div>
    </DotPatternBackground>
  );
}
