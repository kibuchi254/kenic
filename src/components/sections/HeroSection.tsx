import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, Zap, Globe, Check, ArrowRight, Star, Wifi, Link, Server, Cloud, Info, DollarSign, Loader2 } from 'lucide-react';
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
  isLoading?: boolean;
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

interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number;
}

// Cache utility class
class DomainCache {
  private static instance: DomainCache;
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DomainCache {
    if (!DomainCache.instance) {
      DomainCache.instance = new DomainCache();
    }
    return DomainCache.instance;
  }

  set(key: string, data: any, customExpiry?: number): void {
    const expiry = customExpiry || this.DEFAULT_EXPIRY;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiry
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const navigate = useNavigate();

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Cache instance
  const cache = DomainCache.getInstance();

  // Request deduplication
  const activeRequests = useRef(new Map<string, Promise<any>>());

  // All available .ke extensions with their details
  const allKeExtensions: KEExtension[] = useMemo(() => [
    {
      ext: '.co.ke',
      desc: 'For commercial enterprises and businesses',
      popular: true,
      category: 'Commercial',
      eligibility: 'Any individual or organization',
      priceDisplay: 'Loading...'
    },
    {
      ext: '.me.ke',
      desc: 'For personal websites and individuals',
      popular: true,
      category: 'Personal',
      eligibility: 'Any individual',
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
    }
  ], []);

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

  // Preload popular extensions on mount
  useEffect(() => {
    preloadPopularExtensions();
  }, []);

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      handleDebouncedSearch(debouncedSearchQuery);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setError(null);
    }
  }, [debouncedSearchQuery]);

  // Deduplicated API request helper
  const makeRequest = useCallback(<T,>(key: string, requestFn: () => Promise<T>): Promise<T> => {
    // Check if we already have an active request for this key
    if (activeRequests.current.has(key)) {
      return activeRequests.current.get(key) as Promise<T>;
    }

    // Create new request
    const request = requestFn().finally(() => {
      activeRequests.current.delete(key);
    });

    activeRequests.current.set(key, request);
    return request;
  }, []);

  // Enhanced caching for domain pricing
  const getDomainPricing = useCallback(async (extension: string): Promise<DomainPricing | null> => {
    const cacheKey = `pricing:${extension}`;

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`[Cache] Using cached pricing for ${extension}`);
      return cached;
    }

    try {
      const response = await makeRequest(cacheKey, () =>
        axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/domains/pricing/${extension}`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        )
      );

      if (response.data.success && response.data.data) {
        const pricing = response.data.data as DomainPricing;
        // Cache for 10 minutes (pricing doesn't change often)
        cache.set(cacheKey, pricing, 10 * 60 * 1000);
        return pricing;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching pricing for ${extension}:`, error);
      return null;
    }
  }, [cache, makeRequest]);

  // Batch domain availability check
  const checkBatchDomainAvailability = useCallback(async (domains: string[]): Promise<Map<string, {available: boolean, pricing?: DomainPricing}>> => {
    const results = new Map<string, {available: boolean, pricing?: DomainPricing}>();

    // Check cache first for all domains
    const uncachedDomains: string[] = [];

    domains.forEach(domain => {
      const cacheKey = `availability:${domain}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        results.set(domain, cached);
      } else {
        uncachedDomains.push(domain);
      }
    });

    if (uncachedDomains.length === 0) {
      return results;
    }

    try {
      // Try batch API call first (if supported)
      const response = await makeRequest(`batch:${uncachedDomains.join(',')}`, () =>
        axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/domains/availability/batch`,
          { domains: uncachedDomains },
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: 20000,
          }
        )
      );

      if (response.data.success && response.data.data) {
        Object.entries(response.data.data).forEach(([domain, data]: [string, any]) => {
          const result = {
            available: data.status === 'available' || data.available === true,
            pricing: data.pricing || null
          };
          results.set(domain, result);
          // Cache for 2 minutes (availability can change)
          cache.set(`availability:${domain}`, result, 2 * 60 * 1000);
        });
      }
    } catch (error) {
      console.log('[Batch] Batch API not available, falling back to individual checks');

      // Fallback: parallel individual requests
      const individualResults = await Promise.allSettled(
        uncachedDomains.map(async (domain) => {
          const result = await checkDomainAvailabilityWithPricing(domain);
          return { domain, result };
        })
      );

      individualResults.forEach((promiseResult) => {
        if (promiseResult.status === 'fulfilled') {
          const { domain, result } = promiseResult.value;
          results.set(domain, result);
        }
      });
    }

    return results;
  }, [cache, makeRequest]);

  // Individual domain availability check (fallback)
  const checkDomainAvailabilityWithPricing = useCallback(async (domain: string): Promise<{available: boolean, pricing?: DomainPricing}> => {
    const cacheKey = `availability:${domain}`;

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await makeRequest(cacheKey, () =>
        axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/domains/availability/check`,
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
        )
      );

      const responseData = response.data;

      if (responseData.success !== true) {
        throw new Error(responseData.message || 'Domain availability check failed');
      }

      const { available, status, pricing } = responseData.data;
      const isAvailable = status === 'available' || available === true;

      const result = {
        available: isAvailable,
        pricing: pricing || null
      };

      // Cache for 2 minutes
      cache.set(cacheKey, result, 2 * 60 * 1000);

      return result;
    } catch (err: any) {
      console.error(`Error checking availability for ${domain}:`, err);
      return { available: false };
    }
  }, [cache, makeRequest]);

  // Preload popular extensions
  const preloadPopularExtensions = useCallback(async () => {
    setLoadingExtensions(true);

    const popularExtensions = allKeExtensions.filter(ext => ext.popular);

    // Load pricing for popular extensions in parallel
    const pricingPromises = popularExtensions.map(async (extension) => {
      const pricing = await getDomainPricing(extension.ext);
      const displayPrice = pricing && pricing.registration['1_year']
        ? `KSh ${pricing.registration['1_year'].toLocaleString()}/year`
        : 'Contact for pricing';

      return {
        ...extension,
        pricing,
        priceDisplay: displayPrice
      };
    });

    try {
      const updatedExtensions = await Promise.all(pricingPromises);
      setKeExtensions(prevExtensions => {
        const newExtensions = [...prevExtensions];
        updatedExtensions.forEach(updated => {
          const index = newExtensions.findIndex(ext => ext.ext === updated.ext);
          if (index >= 0) {
            newExtensions[index] = updated;
          } else {
            newExtensions.push(updated);
          }
        });
        return newExtensions;
      });
    } catch (error) {
      console.error('Error preloading popular extensions:', error);
    } finally {
      setLoadingExtensions(false);
    }

    // Load remaining extensions in background
    setTimeout(() => loadRemainingExtensions(), 1000);
  }, [allKeExtensions, getDomainPricing]);

  // Load remaining extensions in background
  const loadRemainingExtensions = useCallback(async () => {
    const remainingExtensions = allKeExtensions.filter(ext => !ext.popular);

    const pricingPromises = remainingExtensions.map(async (extension) => {
      const pricing = await getDomainPricing(extension.ext);
      const displayPrice = pricing && pricing.registration['1_year']
        ? `KSh ${pricing.registration['1_year'].toLocaleString()}/year`
        : 'Contact for pricing';

      return {
        ...extension,
        pricing,
        priceDisplay: displayPrice
      };
    });

    try {
      const updatedExtensions = await Promise.all(pricingPromises);
      setKeExtensions(prevExtensions => {
        const newExtensions = [...prevExtensions];
        updatedExtensions.forEach(updated => {
          const index = newExtensions.findIndex(ext => ext.ext === updated.ext);
          if (index >= 0) {
            newExtensions[index] = updated;
          } else {
            newExtensions.push(updated);
          }
        });
        return newExtensions;
      });
    } catch (error) {
      console.error('Error loading remaining extensions:', error);
    }
  }, [allKeExtensions, getDomainPricing]);

  // Optimized suggestion generation with skeleton loading
  const generateSuggestions = useCallback(async (query: string): Promise<DomainSuggestion[]> => {
    if (!query || query.length < 2) return [];

    const cleanQuery = query.toLowerCase()
      .replace(/\.(co\.ke|or\.ke|ac\.ke|go\.ke|me\.ke|ne\.ke|sc\.ke)$/i, '')
      .replace(/[^a-z0-9-]/g, '')
      .trim();

    if (!cleanQuery || cleanQuery.length < 2) return [];

    // Get popular extensions first, then others
    const popularExtensions = keExtensions.filter(ext => ext.popular);
    const otherExtensions = keExtensions.filter(ext => !ext.popular);
    const extensionsToCheck = [...popularExtensions, ...otherExtensions];

    // Create skeleton suggestions immediately
    const skeletonSuggestions: DomainSuggestion[] = extensionsToCheck.map((extension) => ({
      domain: cleanQuery,
      extension: {
        ext: extension.ext,
        desc: extension.desc,
        popular: extension.popular,
        price: extension.priceDisplay
      },
      available: null, // null means loading
      pricing: extension.pricing,
      price: extension.pricing?.registration['1_year'] || 0,
      isLoading: true,
    }));

    // Return skeleton first for immediate UI response
    setSuggestions(skeletonSuggestions);
    setShowSuggestions(true);

    // Generate full domain names for batch check
    const domainsToCheck = extensionsToCheck.map(ext => `${cleanQuery}${ext.ext}`);

    try {
      // Check availability in batch
      const availabilityResults = await checkBatchDomainAvailability(domainsToCheck);

      // Update suggestions with real data
      const finalSuggestions = skeletonSuggestions.map((suggestion, index) => {
        const fullDomain = `${cleanQuery}${suggestion.extension.ext}`;
        const availabilityData = availabilityResults.get(fullDomain);

        return {
          ...suggestion,
          available: availabilityData?.available ?? false,
          pricing: availabilityData?.pricing || suggestion.pricing,
          isLoading: false,
        };
      });

      // Sort: available first, then popular, then by price
      finalSuggestions.sort((a, b) => {
        if (a.available && !b.available) return -1;
        if (!a.available && b.available) return 1;
        if (a.extension.popular && !b.extension.popular) return -1;
        if (!a.extension.popular && b.extension.popular) return 1;
        return a.price - b.price;
      });

      return finalSuggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Return skeleton with error state
      return skeletonSuggestions.map(s => ({ ...s, available: false, isLoading: false }));
    }
  }, [keExtensions, checkBatchDomainAvailability]);

  // Debounced search handler
  const handleDebouncedSearch = useCallback(async (query: string) => {
    console.log(`[Search] Auto-searching for: "${query}"`);

    setIsSearching(true);
    setError(null);

    try {
      const newSuggestions = await generateSuggestions(query);

      if (newSuggestions.length === 0) {
        setError('No domain suggestions could be generated. Please try a different search term.');
        setShowSuggestions(false);
      } else {
        setSuggestions(newSuggestions);
        setShowSuggestions(true);

        const availableCount = newSuggestions.filter(s => s.available).length;
        console.log(`[Search] Auto-search completed: ${availableCount}/${newSuggestions.length} domains available`);
      }
    } catch (err: any) {
      console.error('[Search] Auto-search failed:', err);
      setError(err.message || 'Failed to search domains. Please check your connection and try again.');
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, [generateSuggestions]);

  // Manual search handler (for button click)
  const handleManualSearch = useCallback(async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setError('Please enter at least 2 characters for domain search');
      return;
    }

    // If we already have results for this query, don't search again
    if (showSuggestions && suggestions.length > 0 && !isSearching) {
      return;
    }

    await handleDebouncedSearch(trimmedQuery);
  }, [searchQuery, showSuggestions, suggestions, isSearching, handleDebouncedSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setError(null);

    if (value.trim().length <= 1) {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleManualSearch();
    }
  }, [handleManualSearch]);

  const handleDomainSelect = useCallback((suggestion: DomainSuggestion) => {
    if (!suggestion.available || suggestion.isLoading) {
      console.log(`[HeroSection] Cannot select unavailable/loading domain: ${suggestion.domain}${suggestion.extension.ext}`);
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
  }, [navigate]);

  const handleExtensionSelect = useCallback((extension: KEExtension) => {
    console.log(`[HeroSection] Extension selected: ${extension.ext}`);
    setShowAllExtensions(false);
  }, []);

  const formatPrice = useCallback((pricing: DomainPricing | null): string => {
    if (!pricing || !pricing.registration['1_year']) {
      return 'Contact for pricing';
    }

    return `KSh ${pricing.registration['1_year'].toLocaleString()}/year`;
  }, []);

  // Skeleton loading component
  const SkeletonCard = () => (
    <div className="group p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-48 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        </div>
      </div>
    </div>
  );

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
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        placeholder="What's your big idea? Search for your .ke domain..."
                        className="w-full pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg font-medium bg-input rounded-xl sm:rounded-2xl border border-input-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200 placeholder-muted-foreground"
                      />
                      {/* Loading indicator in input */}
                      {isSearching && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleManualSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/25 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
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
                {/* Suggestions Panel with Live Pricing and Optimistic UI */}
                {showSuggestions && (
                  <div className="border-t border-gray-100 bg-gray-50/30 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm sm:text-base font-semibold text-foreground">
                          Domain Availability with Live Pricing
                        </span>
                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        {isSearching && (
                          <span className="text-xs text-muted-foreground">(updating...)</span>
                        )}
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
                        suggestion.isLoading ? (
                          <SkeletonCard key={`skeleton-${index}`} />
                        ) : (
                          <div
                            key={`${suggestion.domain}-${suggestion.extension.ext}`}
                            className={`group p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border transition-all duration-200 ${
                              suggestion.available
                                ? 'border-gray-200 hover:border-primary/30 hover:shadow-md cursor-pointer'
                                : 'border-gray-200 opacity-75'
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
                                  {index < 2 && (
                                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                      Top Pick
                                    </span>
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
                                  <div className="flex items-center space-x-1">
                                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                    <span className="text-xs sm:text-sm text-gray-500 font-medium">Checking...</span>
                                  </div>
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
                        )
                      ))}
                    </div>
                    {/* Quick suggestions hint */}
                    {suggestions.some(s => s.available) && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                          💡 <strong>Pro tip:</strong> Popular extensions (.co.ke, .me.ke) are shown first.
                          Click any available domain to proceed with registration!
                        </p>
                      </div>
                    )}
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
            {/* Enhanced Stats Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 max-w-5xl mx-auto px-4 mt-12">
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
                  &lt;300ms
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-tight">
                  Search<br className="sm:hidden" /> Response
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
      {/* Enhanced All .ke Extensions Modal */}
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
                    {loadingExtensions && (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    )}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Choose the perfect Kenyan domain extension for your needs • Live pricing included
                  </p>
                </div>
                <button
                  onClick={() => setShowAllExtensions(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {loadingExtensions && keExtensions.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading current pricing...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Popular Extensions First */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                      <Star className="w-5 h-5 text-amber-500 fill-current" />
                      <span>Popular Extensions</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {keExtensions.filter(ext => ext.popular).map((extension, index) => (
                        <ExtensionCard
                          key={extension.ext}
                          extension={extension}
                          onSelect={handleExtensionSelect}
                          isPopular={true}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Other Extensions */}
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-4">
                      Specialized Extensions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {keExtensions.filter(ext => !ext.popular).map((extension, index) => (
                        <ExtensionCard
                          key={extension.ext}
                          extension={extension}
                          onSelect={handleExtensionSelect}
                          isPopular={false}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
              {/* Extension Categories Info */}
              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
                  <Info className="w-4 h-4" />
                  <span>About .ke Extensions</span>
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• <strong>.co.ke</strong> - Most popular for businesses and commercial use</p>
                  <p>• <strong>.me.ke</strong> - Great for personal branding and portfolios</p>
                  <p>• <strong>.or.ke</strong> - Perfect for organizations and NGOs</p>
                  <p>• <strong>.ac.ke</strong> - Reserved for academic institutions</p>
                  <p>• <strong>All domains</strong> are managed by KENIC with full local support</p>
                </div>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Prices updated in real-time from our registrar partners</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowAllExtensions(false)}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-gray-100"
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
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Start Search</span>
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

// Extension Card Component
const ExtensionCard: React.FC<{
  extension: KEExtension;
  onSelect: (extension: KEExtension) => void;
  isPopular: boolean;
}> = ({ extension, onSelect, isPopular }) => (
  <div
    className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
      isPopular
        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 hover:shadow-lg'
        : 'bg-gray-50 hover:bg-white border-gray-200 hover:border-primary/30 hover:shadow-lg'
    }`}
    onClick={() => onSelect(extension)}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-2">
        <span className={`text-lg font-bold ${isPopular ? 'text-blue-700' : 'text-primary'}`}>
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
        <span className={`font-medium px-2 py-1 rounded ${
          isPopular ? 'text-blue-700 bg-blue-100' : 'text-foreground bg-gray-100'
        }`}>
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
          <span className={`font-medium ${isPopular ? 'text-blue-700' : 'text-primary'}`}>
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
      <ArrowRight className={`w-4 h-4 transition-colors ${
        isPopular
          ? 'text-blue-500 group-hover:text-blue-700'
          : 'text-muted-foreground group-hover:text-primary'
      }`} />
    </div>
  </div>
);
