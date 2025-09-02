import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, Zap, Globe, Check, ArrowRight, Star, Wifi, Link, Server, Cloud, Info, DollarSign } from 'lucide-react';
import axios from 'axios';

interface DomainPricing {
  currency: string;
  registration: {
    '1_year'?: number;
    '2_years'?: number;
    '3_years'?: number;
    '5_years'?: number;
    '10_years'?: number;
  };
  renewal: {
    '1_year'?: number;
    '2_years'?: number;
    '3_years'?: number;
    '5_years'?: number;
    '10_years'?: number;
  };
  transfer?: any;
  setup_fee: number;
  taxes?: any;
  source?: string;
}

interface DomainSuggestion {
  domain: string;
  extension: { 
    ext: string; 
    desc: string; 
    popular: boolean; 
    price: string;
  };
  available: boolean | null;
  pricing?: DomainPricing | null;
  price: number;
}

interface KEExtension {
  ext: string;
  desc: string;
  popular: boolean;
  category: string;
  eligibility: string;
  pricing?: DomainPricing | null;
  priceDisplay: string;
}

interface AnimatedNode {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: number;
  opacity: number;
}

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAllExtensions, setShowAllExtensions] = useState(false);
  const [keExtensions, setKeExtensions] = useState<KEExtension[]>([]);
  const [loadingExtensions, setLoadingExtensions] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [animatedNodes, setAnimatedNodes] = useState<AnimatedNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // All available .ke extensions with their details
  const allKeExtensions: KEExtension[] = [
    { 
      ext: '.co.ke', 
      desc: 'For commercial enterprises and businesses', 
      popular: true, 
      category: 'Commercial',
      eligibility: 'Any individual or organization',
      priceDisplay: 'Loading...'
    },
    { 
      ext: '.or.ke', 
      desc: 'For organizations and NGOs', 
      popular: false, 
      category: 'Organization',
      eligibility: 'Non-profit organizations',
      priceDisplay: 'Loading...'
    },
    { 
      ext: '.ac.ke', 
      desc: 'For academic institutions', 
      popular: false, 
      category: 'Academic',
      eligibility: 'Educational institutions only',
      priceDisplay: 'Loading...'
    },
    { 
      ext: '.go.ke', 
      desc: 'For government entities', 
      popular: false, 
      category: 'Government',
      eligibility: 'Government organizations only',
      priceDisplay: 'Loading...'
    },
    { 
      ext: '.ne.ke', 
      desc: 'For network providers and ISPs', 
      popular: false, 
      category: 'Network',
      eligibility: 'Network service providers',
      priceDisplay: 'Loading...'
    },
    { 
      ext: '.sc.ke', 
      desc: 'For schools and educational institutions', 
      popular: false, 
      category: 'Education',
      eligibility: 'Schools and colleges',
      priceDisplay: 'Loading...'
    },
    { 
      ext: '.me.ke', 
      desc: 'For personal websites and individuals', 
      popular: true, 
      category: 'Personal',
      eligibility: 'Any individual',
      priceDisplay: 'Loading...'
    }
  ];

  // Generate network nodes for background animation
  useEffect(() => {
    const nodes: AnimatedNode[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 0.3 + 0.1,
      direction: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.3 + 0.1,
    }));
    setAnimatedNodes(nodes);
    const animateNodes = () => {
      setAnimatedNodes((prev) =>
        prev.map((node) => ({
          ...node,
          x: (node.x + Math.cos(node.direction) * node.speed) % 100,
          y: (node.y + Math.sin(node.direction) * node.speed) % 100,
        }))
      );
    };
    const interval = setInterval(animateNodes, 150);
    return () => clearInterval(interval);
  }, []);

  // Handle mouse movement for subtle background effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Load pricing for all .ke extensions on component mount
  useEffect(() => {
    loadAllExtensionPricing();
  }, []);

  // Load pricing for all .ke extensions
  const loadAllExtensionPricing = async () => {
    setLoadingExtensions(true);
    
    const updatedExtensions = await Promise.all(
      allKeExtensions.map(async (extension) => {
        try {
          const pricing = await getDomainPricing(extension.ext);
          const displayPrice = pricing && pricing.registration['1_year'] 
            ? `KSh ${pricing.registration['1_year'].toLocaleString()}/year`
            : 'Contact for pricing';
          
          return {
            ...extension,
            pricing,
            priceDisplay: displayPrice
          };
        } catch (error) {
          console.error(`Error loading pricing for ${extension.ext}:`, error);
          return {
            ...extension,
            pricing: null,
            priceDisplay: 'Price unavailable'
          };
        }
      })
    );

    setKeExtensions(updatedExtensions);
    setLoadingExtensions(false);
  };

  // Get domain pricing from API
  const getDomainPricing = async (extension: string): Promise<DomainPricing | null> => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/pricing/${extension}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data as DomainPricing;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching pricing for ${extension}:`, error);
      return null;
    }
  };

  // Check domain availability with pricing via DigitalKenya API
  const checkDomainAvailabilityWithPricing = async (domain: string): Promise<{available: boolean, pricing?: DomainPricing}> => {
    try {
      console.log(`[HeroSection] Checking availability with pricing for: ${domain}`);
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/availability/check`,
        {
          params: { 
            domain: domain.trim().toLowerCase(),
            include_pricing: true,
            include_suggestions: false
          },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      console.log(`[HeroSection] API Response for ${domain}:`, response.data);

      const responseData = response.data;
      
      if (responseData.success !== true) {
        throw new Error(responseData.message || 'Domain availability check failed');
      }

      const { available, status, pricing } = responseData.data;
      
      const isAvailable = status === 'available' || available === true;
      
      console.log(`[HeroSection] Domain: ${domain}, Available: ${isAvailable}, Pricing:`, pricing);
      
      return {
        available: isAvailable,
        pricing: pricing || null
      };
      
    } catch (err: any) {
      console.error(`[HeroSection] Error checking availability for ${domain}:`, err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout - please try again');
      } else if (err.response?.status === 429) {
        setError('Too many requests - please wait a moment and try again');
      } else if (err.response?.status >= 500) {
        setError('Server error - please try again later');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(`Failed to check availability for ${domain}. Please try again.`);
      }
      
      return { available: false };
    }
  };

  // Generate domain suggestions with live pricing
  const generateSuggestions = async (query: string): Promise<DomainSuggestion[]> => {
    if (!query || query.length < 2) return [];

    const cleanQuery = query.toLowerCase()
      .replace(/\.(co\.ke|or\.ke|ac\.ke|go\.ke|me\.ke|ne\.ke|sc\.ke)$/i, '')
      .replace(/[^a-z0-9-]/g, '')
      .trim();

    if (!cleanQuery || cleanQuery.length < 2) return [];

    // Use the loaded extensions with pricing
    const extensionsToCheck = keExtensions.length > 0 ? keExtensions : allKeExtensions.slice(0, 4);

    const suggestions: DomainSuggestion[] = [];
    
    const availabilityPromises = extensionsToCheck.map(async (extension) => {
      const fullDomain = `${cleanQuery}${extension.ext}`;
      const result = await checkDomainAvailabilityWithPricing(fullDomain);
      
      const displayPrice = extension.pricing && extension.pricing.registration['1_year'] 
        ? extension.pricing.registration['1_year']
        : parseInt(extension.priceDisplay.replace(/[^0-9]/g, '')) || 0;
      
      return {
        domain: cleanQuery,
        extension: {
          ext: extension.ext,
          desc: extension.desc,
          popular: extension.popular,
          price: extension.priceDisplay
        },
        available: result.available,
        pricing: result.pricing || extension.pricing,
        price: displayPrice,
      };
    });

    try {
      const results = await Promise.all(availabilityPromises);
      suggestions.push(...results);
      
      console.log(`[HeroSection] Generated ${suggestions.length} suggestions with pricing for "${cleanQuery}"`);
      
      suggestions.sort((a, b) => {
        if (a.available && !b.available) return -1;
        if (!a.available && b.available) return 1;
        if (a.extension.popular && !b.extension.popular) return -1;
        if (!a.extension.popular && b.extension.popular) return 1;
        return 0;
      });
      
    } catch (error) {
      console.error('[HeroSection] Error generating suggestions:', error);
      setError('Failed to check domain availability. Please try again.');
    }

    return suggestions;
  };

  // Enhanced search handler
  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setError('Please enter at least 2 characters for domain search');
      return;
    }

    console.log(`[HeroSection] Starting search for: "${trimmedQuery}"`);
    
    setIsSearching(true);
    setShowSuggestions(false);
    setError(null);
    setSuggestions([]);

    try {
      const newSuggestions = await generateSuggestions(trimmedQuery);
      
      if (newSuggestions.length === 0) {
        setError('No domain suggestions could be generated. Please try a different search term.');
        setShowSuggestions(false);
      } else {
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
        
        const availableCount = newSuggestions.filter(s => s.available).length;
        console.log(`[HeroSection] Search completed: ${availableCount}/${newSuggestions.length} domains available`);
      }
      
    } catch (err: any) {
      console.error('[HeroSection] Search failed:', err);
      setError(err.message || 'Failed to search domains. Please check your connection and try again.');
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setError(null);
    
    if (value.trim().length <= 2) {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleDomainSelect = (suggestion: DomainSuggestion) => {
    if (!suggestion.available) {
      console.log(`[HeroSection] Cannot select unavailable domain: ${suggestion.domain}${suggestion.extension.ext}`);
      return;
    }

    const selectedDomain = `${suggestion.domain}${suggestion.extension.ext}`;
    console.log(`[HeroSection] Domain selected: ${selectedDomain}, Price: ${suggestion.price}`);

    try {
      navigate('/registrars', {
        state: {
          domain: selectedDomain,
          price: suggestion.price,
          extension: suggestion.extension,
          pricing: suggestion.pricing,
        },
      });
    } catch (error) {
      console.error('[HeroSection] Navigation error:', error);
      setError('Failed to proceed to registrar selection. Please try again.');
    }
  };

  const handleExtensionSelect = (extension: KEExtension) => {
    console.log(`[HeroSection] Extension selected: ${extension.ext}`);
    // You can add navigation logic here or just show more details
    setShowAllExtensions(false);
  };

  const formatPrice = (pricing: DomainPricing | null): string => {
    if (!pricing || !pricing.registration['1_year']) {
      return 'Contact for pricing';
    }
    return `KSh ${pricing.registration['1_year'].toLocaleString()}/year`;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-brand-canvas via-white to-white overflow-hidden">
      {/* Enhanced Background with Web Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--brand-primary)/0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,hsl(var(--brand-primary)/0.02)_50%,transparent_75%)]" />
        <div
          className="absolute inset-0 opacity-30 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, hsl(var(--brand-primary) / 0.1), transparent 50%)`,
          }}
        />
        
        <svg className="absolute inset-0 w-full h-full opacity-20" style={{ zIndex: 1 }}>
          <defs>
            <filter id="subtleGlow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="brandConnectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--brand-primary) / 0.3)" />
              <stop offset="100%" stopColor="hsl(var(--brand-primary) / 0.1)" />
            </linearGradient>
          </defs>

          {animatedNodes.map((node, i) =>
            animatedNodes.slice(i + 1).map((otherNode, j) => {
              const distance = Math.sqrt(
                Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
              );
              return distance < 20 ? (
                <line
                  key={`${i}-${j}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${otherNode.x}%`}
                  y2={`${otherNode.y}%`}
                  stroke="url(#brandConnectionGradient)"
                  strokeWidth="0.3"
                  opacity={Math.max(0, 0.4 - distance / 20)}
                />
              ) : null;
            })
          )}

          {animatedNodes.map((node) => (
            <circle
              key={node.id}
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.size}
              fill="hsl(var(--brand-primary) / 0.4)"
              opacity={node.opacity}
              filter="url(#subtleGlow)"
            />
          ))}
        </svg>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
          <div className="absolute top-32 left-16 animate-float-gentle">
            <div className="p-2 bg-primary/5 backdrop-blur-sm rounded-lg border border-primary/10">
              <Server className="w-4 h-4 text-primary/40" />
            </div>
          </div>
          <div className="absolute top-48 right-24 animate-float-gentle-delayed">
            <div className="p-2 bg-accent/5 backdrop-blur-sm rounded-lg border border-accent/10">
              <Cloud className="w-4 h-4 text-accent/40" />
            </div>
          </div>
          <div className="absolute bottom-40 left-20 animate-float-gentle-slow">
            <div className="p-2 bg-primary/5 backdrop-blur-sm rounded-lg border border-primary/10">
              <Wifi className="w-4 h-4 text-primary/40" />
            </div>
          </div>
          <div className="absolute bottom-32 right-28 animate-float-gentle">
            <div className="p-2 bg-success/5 backdrop-blur-sm rounded-lg border border-success/10">
              <Link className="w-4 h-4 text-success/40" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-accent/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-primary/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen flex flex-col justify-center py-12 sm:py-16 lg:py-20">
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-primary/20 shadow-sm flex items-center space-x-1.5 sm:space-x-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-foreground">Official KENIC</span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-success/20 shadow-sm flex items-center space-x-1.5 sm:space-x-2">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
              <span className="text-xs sm:text-sm font-medium text-foreground">Live Pricing</span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-accent/20 shadow-sm flex items-center space-x-1.5 sm:space-x-2">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
              <span className="text-xs sm:text-sm font-medium text-foreground">Instant Setup</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center mb-4 sm:mb-6 lg:mb-8 max-w-5xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight mb-3 sm:mb-4 lg:mb-6">
              Secure Your Digital Identity.
              <span className="block gradient-text">
                Power Your Kenyan Dream.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-2 sm:mb-3 max-w-4xl mx-auto leading-relaxed px-4">
              The official home of Kenyan businesses.
              <span className="font-semibold text-foreground"> Fast, secure, and uniquely yours.</span>
            </p>

            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Managed by KENIC, the trusted authority with live pricing
            </p>
          </div>

          {/* Modern Search Section */}
          <div className="max-w-4xl mx-auto w-full mb-8 sm:mb-12 lg:mb-16 px-4">
            <div className="relative">
              {/* Main Search Container */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-border overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="What's your big idea? Search for your .ke domain..."
                        className="w-full pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg font-medium bg-input rounded-xl sm:rounded-2xl border border-input-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200 placeholder-muted-foreground"
                      />
                    </div>

                    <button
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/25 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isSearching ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5" />
                          <span>Search Domain</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-t border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Suggestions Panel with Live Pricing */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50/30 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm sm:text-base font-semibold text-foreground">Domain Availability with Live Pricing</span>
                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <button
                        onClick={() => setShowAllExtensions(true)}
                        className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium flex items-center space-x-1"
                      >
                        <Globe className="w-3 h-3" />
                        <span>View all .ke extensions</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className={`group p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all duration-200 ${
                            suggestion.available ? 'cursor-pointer' : 'opacity-75'
                          }`}
                          onClick={() => suggestion.available && handleDomainSelect(suggestion)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-bold text-foreground text-sm sm:text-base truncate">
                                  {suggestion.domain}{suggestion.extension.ext}
                                </span>
                                {suggestion.extension.popular && (
                                  <Star className="w-3 h-3 text-primary fill-current" />
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                                {suggestion.extension.desc}
                              </p>
                              <div className="flex items-center space-x-2">
                                <p className="text-xs sm:text-sm font-semibold text-primary">
                                  {formatPrice(suggestion.pricing)}
                                </p>
                                {suggestion.pricing?.source && (
                                  <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                    {suggestion.pricing.source === 'whmcs' ? 'Live' : 'Est.'}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-2">
                              {suggestion.available === null ? (
                                <span className="text-xs sm:text-sm text-gray-500 font-medium">Checking...</span>
                              ) : suggestion.available ? (
                                <div className="flex items-center space-x-1 text-green-600">
                                  <Check className="w-4 h-4" />
                                  <span className="text-xs sm:text-sm font-medium">Available</span>
                                </div>
                              ) : (
                                <span className="text-xs sm:text-sm text-red-500 font-medium">Taken</span>
                              )}
                              {suggestion.available && (
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Actions */}
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm sm:text-base">
                <button 
                  onClick={() => setShowAllExtensions(true)}
                  className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center space-x-1"
                >
                  <Globe className="w-4 h-4" />
                  <span>Explore All .ke Extensions</span>
                </button>
                <button className="text-muted-foreground hover:text-foreground font-medium transition-colors">
                  Why choose a .ke Domain?
                </button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 max-w-5xl mx-auto px-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">
                  250K+
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-tight">
                  .ke Domains<br className="sm:hidden" /> Registered
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">
                  99.9%
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-tight">
                  Uptime<br className="sm:hidden" /> Guarantee
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">
                  24/7
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-tight">
                  Local<br className="sm:hidden" /> Support
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">
                  7+
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-tight">
                  .ke Extensions<br className="sm:hidden" /> Available
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All .ke Extensions Modal */}
      {showAllExtensions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-foreground flex items-center space-x-2">
                    <Globe className="w-6 h-6 text-primary" />
                    <span>All .ke Extensions</span>
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Choose the perfect Kenyan domain extension for your needs
                  </p>
                </div>
                <button
                  onClick={() => setShowAllExtensions(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {loadingExtensions ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading current pricing...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keExtensions.map((extension, index) => (
                    <div
                      key={index}
                      className="group p-4 bg-gray-50 hover:bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-200 cursor-pointer"
                      onClick={() => handleExtensionSelect(extension)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-primary">
                            {extension.ext}
                          </span>
                          {extension.popular && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-amber-500 fill-current" />
                              <span className="text-xs text-amber-600 font-medium">Popular</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-foreground">
                            {extension.priceDisplay}
                          </div>
                          {extension.pricing?.source && (
                            <div className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded mt-1">
                              {extension.pricing.source === 'whmcs' ? 'Live Price' : 'Estimate'}
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {extension.desc}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-medium text-foreground bg-gray-100 px-2 py-1 rounded">
                            {extension.category}
                          </span>
                        </div>
                        <div className="flex items-start justify-between text-xs">
                          <span className="text-muted-foreground">Eligibility:</span>
                          <span className="text-right font-medium text-foreground max-w-[60%]">
                            {extension.eligibility}
                          </span>
                        </div>
                        {extension.pricing && extension.pricing.registration['2_years'] && (
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
                            <span className="text-muted-foreground">2 years:</span>
                            <span className="font-medium text-primary">
                              KSh {extension.pricing.registration['2_years'].toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Info className="w-3 h-3" />
                          <span>Click to learn more</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Extension Categories Info */}
              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
                  <Info className="w-4 h-4" />
                  <span>About .ke Extensions</span>
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• <strong>.co.ke</strong> - Most popular for businesses and commercial use</p>
                  <p>• <strong>.or.ke</strong> - Perfect for organizations and NGOs</p>
                  <p>• <strong>.ac.ke</strong> - Reserved for academic institutions</p>
                  <p>• <strong>.me.ke</strong> - Great for personal branding and portfolios</p>
                  <p>• <strong>All domains</strong> are managed by KENIC with full local support</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Prices updated in real-time from our registrar partners
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowAllExtensions(false)}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowAllExtensions(false);
                      // Focus on search input
                      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                      if (searchInput) searchInput.focus();
                    }}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Start Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};