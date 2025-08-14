import React, { useEffect, useRef, useState } from 'react';
import { Shield, Globe, Zap, Award, ArrowRight, Server, Cloud } from 'lucide-react';

export const WhyKenicSection = () => {
  const sectionRef = useRef(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // IntersectionObserver for card visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Auto-advance cards on mobile
  useEffect(() => {
    if (isMobile && isIntersecting) {
      const interval = setInterval(() => {
        setActiveCardIndex((prev) => (prev + 1) % 4);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isMobile, isIntersecting]);

  const cards = [
    {
      id: 1,
      badge: 'Authority',
      title: "Kenya's Official Domain Registry",
      subtitle: 'Trusted by the government and businesses nationwide',
      color: 'hsl(var(--brand-primary))',
      icon: Shield,
    },
    {
      id: 2,
      badge: 'Credibility',
      title: 'Build Trust with Kenyan Customers',
      subtitle: 'A .ke domain signals local presence and commitment',
      color: 'hsl(var(--brand-accent))',
      icon: Globe,
    },
    {
      id: 3,
      badge: 'Speed',
      title: 'Lightning-Fast Domain Activation',
      subtitle: 'Get your domain up and running in under 5 minutes',
      color: 'hsl(var(--brand-success))',
      icon: Zap,
    },
    {
      id: 4,
      badge: 'Support',
      title: '24/7 Local Kenyan Support',
      subtitle: 'Get help in English or Swahili from our Kenya-based team',
      color: 'hsl(var(--brand-primary))',
      icon: Award,
    },
  ];

  return (
    <div ref={sectionRef} className="relative bg-white min-h-screen overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--brand-primary)/0.05),transparent_50%)] opacity-50" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,hsl(var(--brand-primary)/0.02)_50%,transparent_75%)] opacity-50" />

      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold shadow-lg">
              02
            </div>
            <span className="text-primary font-semibold tracking-wider uppercase">Why KENIC</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Kenya's Most{' '}
            <span className="gradient-text">
              Trusted Domain Authority
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover why thousands of businesses choose KENIC for their digital presence
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {cards.map((card, index) => {
            const IconComponent = card.icon;
            const isActive = isMobile ? index === activeCardIndex : isIntersecting;

            return (
              <div
                key={card.id}
                className={`relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ${
                  isActive ? 'opacity-100 scale-100 domain-fade-in' : 'opacity-70 scale-95'
                }`}
                style={{
                  borderColor: isActive ? card.color : 'rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className="px-3 py-1 text-xs font-medium text-white rounded-full"
                    style={{ backgroundColor: card.color }}
                  >
                    {card.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col h-full">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${card.color}20` }}
                  >
                    <IconComponent className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground flex-1">
                    {card.subtitle}
                  </p>
                  <div className="flex items-center mt-4">
                    <span className="text-sm font-medium text-primary">Learn more</span>
                    <ArrowRight className="w-4 h-4 ml-2 text-primary" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Indicators */}
        {isMobile && (
          <div className="flex justify-center gap-2 mt-8">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveCardIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeCardIndex === index ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Subtle Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-24 left-12 animate-float-gentle">
          <div className="p-2 bg-primary/10 backdrop-blur-sm rounded-lg border border-primary/10">
            <Server className="w-4 h-4 text-primary/40" />
          </div>
        </div>
        <div className="absolute bottom-32 right-16 animate-float-gentle-delayed">
          <div className="p-2 bg-accent/10 backdrop-blur-sm rounded-lg border border-accent/10">
            <Cloud className="w-4 h-4 text-accent/40" />
          </div>
        </div>
      </div>
    </div>
  );
};