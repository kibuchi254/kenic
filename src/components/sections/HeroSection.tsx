import React, { useState } from 'react';
import { Sparkles, Shield, Zap, Globe } from 'lucide-react';
import { DomainSearchBar } from '@/components/domain/DomainSearchBar';
import { Badge } from '@/components/ui/badge';

export function HeroSection() {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    // Simulate search
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSearching(false);
    console.log('Searching for:', query);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-brand-canvas via-white to-brand-canvas/50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(242,7,50,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(242,7,50,0.02)_50%,transparent_75%)]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badges */}
          <div className="flex justify-center items-center space-x-4 mb-8">
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
              <Shield className="mr-1 h-3 w-3" />
              ICANN Accredited
            </Badge>
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
              <Zap className="mr-1 h-3 w-3" />
              Instant Setup
            </Badge>
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
              <Globe className="mr-1 h-3 w-3" />
              500+ TLDs
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-foreground mb-6 leading-tight">
            Find Your Perfect
            <span className="block gradient-text">Domain Name</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Start your online journey with the perfect domain. 
            <span className="font-semibold text-foreground"> Lightning-fast search</span>, 
            <span className="font-semibold text-foreground"> transparent pricing</span>, and 
            <span className="font-semibold text-foreground"> instant registration</span>.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <DomainSearchBar 
              onSearch={handleSearch} 
              isLoading={isSearching}
              className="mb-8"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">2M+</div>
              <div className="text-sm text-muted-foreground">Domains Registered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Expert Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">500+</div>
              <div className="text-sm text-muted-foreground">TLD Extensions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce delay-1000">
        <div className="w-4 h-4 bg-primary/20 rounded-full"></div>
      </div>
      <div className="absolute bottom-20 right-10 animate-bounce delay-2000">
        <div className="w-6 h-6 bg-accent/20 rounded-full"></div>
      </div>
      <div className="absolute top-1/2 left-20 animate-bounce">
        <Sparkles className="w-8 h-8 text-primary/30" />
      </div>
    </section>
  );
}