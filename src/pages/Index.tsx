import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { PopularTldsSection } from '@/components/sections/PopularTldsSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { WhyKenicSection } from '@/components/sections/WhyKenicSection';
import { X } from 'lucide-react'; // for close icon
import '@/index.css';

const Index = () => {
  const [cartCount, setCartCount] = useState(0);
  const [showIntro, setShowIntro] = useState(false);

  // Show popup shortly after page load
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cartCount} />
      <main>
        <HeroSection />
        <WhyKenicSection />
        <PopularTldsSection />
        <FeaturesSection />
      </main>
      <Footer />

      {/* Modern Feature Intro Popup */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-card rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-8 animate-card-enter">
            
            {/* Close button */}
            <button
              onClick={() => setShowIntro(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl">✨</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center text-2xl font-bold gradient-text mb-3">
              Introducing Something New
            </h2>

            {/* Description */}
            <p className="text-center text-muted-foreground mb-6">
              We’ve added a fresh feature to make your domain journey smoother, faster, 
              and more intuitive than ever before.
            </p>

            {/* Highlights */}
            <div className="grid gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary">
                <span className="text-lg">🚀</span>
                <span className="text-sm font-medium">Lightning-fast domain search</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary">
                <span className="text-lg">🔒</span>
                <span className="text-sm font-medium">Enhanced security for your accounts</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary">
                <span className="text-lg">🎯</span>
                <span className="text-sm font-medium">Cleaner, smarter dashboard</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowIntro(false)}
                className="px-5 py-2.5 rounded-lg font-medium text-primary bg-primary/10 hover:bg-primary/20 transition"
              >
                Learn More
              </button>
              <button
                onClick={() => setShowIntro(false)}
                className="px-5 py-2.5 rounded-lg font-medium text-primary-foreground bg-gradient-to-r from-primary to-accent shadow-primary hover:opacity-90 transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
