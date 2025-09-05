import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { PopularTldsSection } from '@/components/sections/PopularTldsSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { WhyKenicSection } from '@/components/sections/WhyKenicSection';
import { X, Cloud, ShieldCheck, Zap } from 'lucide-react';
import '@/index.css';

const Index = () => {
  const [cartCount, setCartCount] = useState(0);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("seenFeatureIntro");
    if (!hasSeenIntro) {
      const timer = setTimeout(() => setShowIntro(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseIntro = () => {
    setShowIntro(false);
    localStorage.setItem("seenFeatureIntro", "true");
  };

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

      {/* Feature Intro Popup */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-card rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-8 animate-card-enter border border-border">
            
            {/* Close button */}
            <button
              onClick={handleCloseIntro}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent shadow-primary">
                <Cloud className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center text-2xl font-extrabold gradient-text mb-3">
              Free DNS Management
            </h2>

            {/* Subtitle */}
            <p className="text-center text-muted-foreground mb-6 text-base">
              Introducing seamless <span className="font-semibold">Cloudflare integration</span> 
              — manage your DNS effortlessly, with zero extra cost.
            </p>

            {/* Highlights */}
            <div className="grid gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary hover:shadow-md transition">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Lightning-fast propagation</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary hover:shadow-md transition">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Built-in security with Cloudflare</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary hover:shadow-md transition">
                <Cloud className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Centralized domain & DNS control</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCloseIntro}
                className="px-5 py-2.5 rounded-lg font-medium text-primary bg-primary/10 hover:bg-primary/20 transition"
              >
                Learn More
              </button>
              <button
                onClick={handleCloseIntro}
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
