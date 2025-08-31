import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, Zap, Globe, Check, ArrowRight, Star, Wifi, Link, Server, Cloud } from 'lucide-react';
import axios from 'axios';

interface DomainSuggestion {
  domain: string;
  extension: { ext: string; desc: string; popular: boolean; price: string };
  available: boolean | null;
  // isAI: boolean; // Commented out as AI suggestions are disabled
  price: number;
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [animatedNodes, setAnimatedNodes] = useState<AnimatedNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  // Check domain availability via DigitalKenya API
  const checkDomainAvailability = async (domain: string): Promise<boolean> => {
    try {
      console.log(`[HeroSection] Checking availability for: ${domain}`);
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/availability/check`,
        {
          params: { domain: domain.trim().toLowerCase() },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log(`[HeroSection] API Response for ${domain}:`, response.data);

      const responseData = response.data;
      
      // Check if the API call was successful
      if (responseData.success !== true) {
        throw new Error(responseData.message || 'Domain availability check failed');
      }

      // Extract availability data according to DigitalKenya API format
      const { available, status, domain: checkedDomain } = responseData.data;
      
      // Prioritize 'status' field over 'available' field for accuracy
      // Status can be: 'available', 'unavailable', 'pending', etc.
      const isAvailable = status === 'available';
      
      // Log the response for debugging
      console.log(`[HeroSection] Domain: ${checkedDomain}, Available field: ${available}, Status field: ${status}, Final Result: ${isAvailable}`);
      
      // Log discrepancy if available and status fields don't match
      if (available !== isAvailable) {
        console.warn(`[HeroSection] Discrepancy detected for ${checkedDomain}: available=${available}, status=${status}. Using status field.`);
      }
      
      return isAvailable;
      
    } catch (err: any) {
      console.error(`[HeroSection] Error checking availability for ${domain}:`, err);
      
      // Handle different types of errors
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
      
      // Return false for unavailable on error (conservative approach)
      return false;
    }
  };

  // Generate domain suggestions with Kenyan extensions
  const generateSuggestions = async (query: string): Promise<DomainSuggestion[]> => {
    if (!query || query.length < 2) return [];

    // Clean the query - remove any existing extensions and special characters
    const cleanQuery = query.toLowerCase()
      .replace(/\.(co\.ke|or\.ke|ac\.ke|go\.ke|ke)$/i, '')
      .replace(/[^a-z0-9-]/g, '')
      .trim();

    if (!cleanQuery || cleanQuery.length < 2) return [];

    const extensions = [
      { ext: '.co.ke', desc: 'For commercial enterprises', popular: true, price: 'KSh 1,500/year' },
      { ext: '.or.ke', desc: 'For organizations & NGOs', popular: false, price: 'KSh 1,200/year' },
      { ext: '.ac.ke', desc: 'For academic institutions', popular: false, price: 'KSh 2,000/year' },
      { ext: '.go.ke', desc: 'For government entities', popular: false, price: 'KSh 3,000/year' },
    ];

    const suggestions: DomainSuggestion[] = [];
    
    // Check availability for each extension concurrently for better performance
    const availabilityPromises = extensions.map(async (extension) => {
      const fullDomain = `${cleanQuery}${extension.ext}`;
      const available = await checkDomainAvailability(fullDomain);
      
      return {
        domain: cleanQuery,
        extension,
        available,
        price: parseInt(extension.price.replace(/[^0-9]/g, '')), // Extract numeric price
      };
    });

    try {
      const results = await Promise.all(availabilityPromises);
      suggestions.push(...results);
      
      console.log(`[HeroSection] Generated ${suggestions.length} suggestions for "${cleanQuery}"`);
      
      // Sort suggestions: available domains first, then popular extensions
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

  // Enhanced search handler with better error handling and user feedback
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
        
        // Log success metrics
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

  // Enhanced input change handler with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setError(null);
    
    // Clear suggestions when input is too short or empty
    if (value.trim().length <= 2) {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Enhanced key press handler with validation
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission if inside a form
      handleSearch();
    }
  };

  // Enhanced domain selection handler with validation
  const handleDomainSelect = (suggestion: DomainSuggestion) => {
    // Only allow selection of available domains
    if (!suggestion.available) {
      console.log(`[HeroSection] Cannot select unavailable domain: ${suggestion.domain}${suggestion.extension.ext}`);
      return;
    }

    const selectedDomain = `${suggestion.domain}${suggestion.extension.ext}`;
    console.log(`[HeroSection] Domain selected: ${selectedDomain}, Price: ${suggestion.price}`);

    try {
      // Navigate to registrars selection page
      navigate('/registrars', {
        state: {
          domain: selectedDomain,
          price: suggestion.price,
          extension: suggestion.extension,
        },
      });
    } catch (error) {
      console.error('[HeroSection] Navigation error:', error);
      setError('Failed to proceed to registrar selection. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-brand-canvas via-white to-white overflow-hidden">
      {/* Enhanced Background with Web Elements */}
      <div className="absolute inset-0">
        {/* Brand Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--brand-primary)/0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,hsl(var(--brand-primary)/0.02)_50%,transparent_75%)]" />
        <div
          className="absolute inset-0 opacity-30 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, hsl(var(--brand-primary) / 0.1), transparent 50%)`,
          }}
        />
        {/* Subtle Network Background */}
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

          {/* Subtle connection lines */}
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

          {/* Subtle network nodes */}
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
        {/* Subtle Web-themed Floating Elements */}
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
      {/* Floating Brand Elements */}
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
            {/* Commented out AI-Powered badge */}
            {/* <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-accent/20 shadow-sm flex items-center space-x-1.5 sm:space-x-2">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
              <span className="text-xs sm:text-sm font-medium text-foreground">AI-Powered</span>
            </div> */}
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-success/20 shadow-sm flex items-center space-x-1.5 sm:space-x-2">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
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
              {/* Removed AI mention */}
              Managed by KENIC, the trusted authority
            </p>
          </div>
          {/* Modern Search Section */}
          <div className="max-w-4xl mx-auto w-full mb-8 sm:mb-12 lg:mb-16 px-4">
            <div className="relative">
              {/* Main Search Container */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-border overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    {/* Search Input */}
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

                    {/* Search Button */}
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
                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border-t border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                {/* Suggestions Panel (No AI Suggestions) */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50/30 p-4 sm:p-6">
                    {/* Commented out AI Suggestions header */}
                    {/* <div className="flex items-center space-x-2 mb-4">
                      <div className="p-1.5 bg-primary rounded-lg">
                        <Lightbulb className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-foreground">AI Suggestions</span>
                      <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse"></div>
                    </div> */}
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-sm sm:text-base font-semibold text-foreground">Domain Availability</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="group p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={() => handleDomainSelect(suggestion)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-bold text-foreground text-sm sm:text-base truncate">
                                  {suggestion.domain}{suggestion.extension.ext}
                                </span>
                                {/* Commented out AI badge */}
                                {/* {suggestion.isAI && (
                                  <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">
                                    AI
                                  </span>
                                )} */}
                                {suggestion.extension.popular && (
                                  <Star className="w-3 h-3 text-primary fill-current" />
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                                {suggestion.extension.desc}
                              </p>
                              <p className="text-xs sm:text-sm font-semibold text-primary">
                                {suggestion.extension.price}
                              </p>
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
                              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
                <button className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>Explore All Extensions</span>
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
                  15+
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-tight">
                  Years of<br className="sm:hidden" /> Trust
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};