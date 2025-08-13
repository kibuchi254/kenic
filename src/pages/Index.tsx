import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { PopularTldsSection } from '@/components/sections/PopularTldsSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';

const Index = () => {
  const [cartCount, setCartCount] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cartCount} />
      <main>
        <HeroSection />
        <PopularTldsSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
