'use client';

import VocabularyNote from '@/components/VocabularyNote';
import Translation from '@/components/Translation';
import TranslationHistory from '@/components/TranslationHistory';
import VideoPlayer from '@/components/VideoPlayer';
import AuthButton from '@/components/AuthButton';
import ThemeToggle from '@/components/ThemeToggle';
import DotPatternBackground from '@/components/DotPatternBackground';
import DockMenu from '@/components/DockMenu';
import AnimatedCard from '@/components/AnimatedCard';
import { DockMenuProvider, useDockMenu } from '@/components/DockMenuProvider';

// Inner component that uses the dock menu context
function HomeContent() {
  const { visibleCards } = useDockMenu();

  return (
    <DotPatternBackground>
      <div className="min-h-screen py-4 md:py-8">
        <header className="mx-auto mb-8 ml-16 mr-16">
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

        <main className="max-w mx-8 ml-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* First column */}
            <AnimatedCard isVisible={visibleCards.vocabulary} delay={1} className="space-y-6">
              <VocabularyNote />
            </AnimatedCard>

            {/* Second column */}
            <AnimatedCard isVisible={visibleCards.translation} delay={2} className="space-y-6">
              <Translation />
            </AnimatedCard>

            {/* Third column */}
            <AnimatedCard isVisible={visibleCards.history} delay={3} className="space-y-6">
              <TranslationHistory />
            </AnimatedCard>

            {/* Fourth column - Video Player with Picture-in-Picture */}
            {/*<AnimatedCard isVisible={visibleCards.video} delay={4} className="space-y-6">*/}
            {/*  <VideoPlayer />*/}
            {/*</AnimatedCard>*/}
          </div>
        </main>

        {/*<footer className="max-w-7xl mx-auto text-center text-sm text-muted-foreground ml-16">*/}
        {/*  <p>Language Learning Hub - A simple application to help you learn languages</p>*/}
        {/*</footer>*/}

        {/* Dock Menu */}
        <DockMenu />
      </div>
    </DotPatternBackground>
  );
}

// Main component that provides the dock menu context
export default function Home() {
  return (
    <DockMenuProvider>
      <HomeContent />
    </DockMenuProvider>
  );
}
