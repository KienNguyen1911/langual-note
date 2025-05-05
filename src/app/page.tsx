'use client';

import { useState } from 'react';
import VocabularyNote from '@/components/VocabularyNote';
import Translation from '@/components/Translation';
import TranslationHistory from '@/components/TranslationHistory';
import AuthButton from '@/components/AuthButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-foreground">Language Learning Hub</h1>
          <AuthButton />
        </div>
        <p className="text-muted-foreground">
          Learn languages effectively with vocabulary notes, translation, and history tracking
        </p>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <VocabularyNote />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Translation />
            <TranslationHistory />
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-12 text-center text-sm text-muted-foreground">
        <p>Language Learning Hub - A simple application to help you learn languages</p>
      </footer>
    </div>
  );
}
