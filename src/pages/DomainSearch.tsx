import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Globe,
  Shield,
  CheckCircle,
  X,
  ArrowRight,
  Star,
  Clock,
  Zap,
  Crown,
  Filter,
  SortDesc,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const API_BASE_URL = 'https://api.digikenya.co.ke';

const DomainSearch = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [pricingCache, setPricingCache] = useState({});

  const extensions = [
    { ext: '.ke', desc: 'Perfect for Kenyan businesses', category: 'local' },
    { ext: '.co.ke', desc: 'For commercial enterprises', category: 'local' },
    { ext: '.or.ke', desc: 'For organizations & NGOs', category: 'local' },
    { ext: '.ne.ke', desc: 'For network services', category: 'local' },
    { ext: '.com', desc: 'Most popular worldwide', category: 'popular' },
    { ext: '.net', desc: 'For network & tech services', category: 'tech' },
    { ext: '.org', desc: 'For organizations', category: 'nonprofit' },
    { ext: '.io', desc: 'Popular with startups', category: 'premium' },
    { ext: '.app', desc: 'Perfect for applications', category: 'modern' },
  ];

  // Check domain availability
  const checkDomainAvailability = async (domain) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/availability/check?domain=${encodeURIComponent(domain)}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      );

      if (!response.ok) {
        return { domain, available: false, status: 'error' };
      }

      const result = await response.json();
      const available = result.data?.status === 'available';
      return { domain, available, status: available ? 'available' : 'taken' };
    } catch (error) {
      return { domain, available: false, status: 'error' };
    }
  };

  // Get domain pricing
  const getDomainPricing = async (extension) => {
    const cleanExtension = extension.replace('.', '');
    if (pricingCache[cleanExtension]) {
      return pricingCache[cleanExtension];
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/pricing/${cleanExtension}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      );

      let price = 1200; // Default price
      if (response.ok) {
        const result = await response.json();
        price = result.price || price;
      }

      const pricingData = { price };
      setPricingCache(prev => ({ ...prev, [cleanExtension]: pricingData }));
      return pricingData;
    } catch (error) {
      const fallbackPrice = { price: 1200 };
      setPricingCache(prev => ({ ...prev, [cleanExtension]: fallbackPrice }));
      return fallbackPrice;
    }
  };

  // Generate domain suggestions
  const generateDomainSuggestions = async (query) => {
    if (!query || query.length < 2) return [];

    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    const alternatives = [
      cleanQuery,
      `my${cleanQuery}`,
      `${cleanQuery}ke`,
      `get${cleanQuery}`,
    ];

    const allDomains = [];
    alternatives.forEach(alt => {
      extensions.forEach(ext => {
        allDomains.push(`${alt}${ext.ext}`);
      });
    });

    // Check availability for all domains
    const availabilityResults = await Promise.all(
      allDomains.map(domain => checkDomainAvailability(domain))
    );

    // Get pricing for all extensions
    const uniqueExtensions = [...new Set(extensions.map(e => e.ext))];
    const pricingPromises = uniqueExtensions.map(ext => getDomainPricing(ext));
    const pricingResults = await Promise.all(pricingPromises);

    const pricingMap = {};
    uniqueExtensions.forEach((ext, index) => {
      pricingMap[ext] = pricingResults[index];
    });

    // Build final results
    const suggestions = [];
    alternatives.forEach(alt => {
      extensions.forEach(extension => {
        const fullDomain = `${alt}${extension.ext}`;
        const availData = availabilityResults.find(r => r.domain === fullDomain);
        const pricingData = pricingMap[extension.ext];

        suggestions.push({
          domain: fullDomain,
          tld: extension.ext,
          price: pricingData?.price || 1200,
          renewal: pricingData?.price || 1200,
          status: availData?.available ? 'available' : 'taken',
          category: extension.category,
          features: availData?.available ? ['SSL', 'DNS', 'Support'] : [],
        });
      });
    });

    return suggestions;
  };

  // Handle domain search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(false);
    setError(null);

    try {
      const results = await generateDomainSuggestions(searchQuery);
      setSearchResults(results);
      setHasSearched(true);
    } catch (error) {
      setError('Failed to search domains. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle domain selection
  const handleDomainSelect = (domain) => {
    if (domain.status === 'taken') return;
    if (onNavigate) {
      onNavigate('checkout', {
        domain: domain.domain,
        price: domain.price,
        renewal: domain.renewal,
        tld: domain.tld,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Globe className="w-8 h-8 text-[hsl(351,94%,48%)]" />
              <span className="text-xl font-bold bg-gradient-to-r from-[hsl(351,94%,48%)] to-[hsl(108,73%,44%)] bg-clip-text text-transparent">
                .KE ZONE
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Find Your Domain</span>
              <Search className="w-5 h-5 text-[hsl(351,94%,48%)]" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(351,94%,48%)]/5 via-white to-[hsl(108,73%,44%)]/5" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(351,94%,48%)]/10 text-[hsl(351,94%,48%)] rounded-full text-sm font-medium mb-4 sm:mb-6">
                <Sparkles className="w-4 h-4" />
                Domain Search
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                Find Your Perfect
                <span className="bg-gradient-to-r from-[hsl(351,94%,48%)] to-[hsl(108,73%,44%)] bg-clip-text text-transparent">
                  {' '}
                  Domain Name
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-12 px-4">
                Search through millions of available domains and secure your online presence today
              </p>

              {/* Search Bar */}
              <div className="group relative max-w-2xl mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(351,94%,48%)] to-[hsl(108,73%,44%)] rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-white border border-gray-200 rounded-2xl p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 ml-3 sm:ml-4 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your domain name"
                      className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg placeholder:text-gray-400 min-w-0 py-2 sm:py-0"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || isSearching}
                    className="bg-gradient-to-r from-[hsl(351,94%,48%)] to-[hsl(108,73%,44%)] text-white px-4 sm:px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
                  >
                    {isSearching ? (
                      <>
                        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span className="hidden sm:inline">Searching...</span>
                        <span className="sm:hidden">Search...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Search Domains</span>
                        <span className="sm:hidden">Search</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Search Results */}
        {hasSearched && !error && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Results for "<span className="break-all">{searchQuery}</span>"
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mb-6">
                {searchResults.length} domains found
              </p>

              {/* Domain Results Grid */}
              <div className="grid gap-4 sm:gap-6">
                {searchResults.map((domain, index) => (
                  <div
                    key={index}
                    className="group relative"
                    style={{ animation: `fadeIn 0.5s ease-out ${index * 0.05}s both` }}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[hsl(351,94%,48%)]/20 to-[hsl(108,73%,44%)]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-6 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[hsl(351,94%,48%)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(351,94%,48%)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="text-lg sm:text-xl font-bold break-all">{domain.domain}</h3>
                              <div
                                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${
                                  domain.status === 'available'
                                    ? 'text-[hsl(108,73%,44%)] bg-[hsl(108,73%,44%)]/10 border-[hsl(108,73%,44%)]/20'
                                    : 'text-gray-500 bg-gray-50 border-gray-200'
                                }`}
                              >
                                {domain.status === 'available' ? (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    Available
                                  </>
                                ) : (
                                  <>
                                    <X className="w-3 h-3" />
                                    Taken
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <span>Reg: KES {domain.price.toLocaleString()}</span>
                                <span className="hidden sm:inline">•</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>Renewal: KES {domain.renewal.toLocaleString()}/yr</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 w-full sm:w-auto">
                          {domain.status === 'available' ? (
                            <button
                              onClick={() => handleDomainSelect(domain)}
                              className="w-full sm:w-auto bg-gradient-to-r from-[hsl(351,94%,48%)] to-[hsl(108,73%,44%)] text-white px-4 sm:px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                              <span className="hidden sm:inline">Select Domain</span>
                              <span className="sm:hidden">Select</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm sm:text-base">
                              <X className="w-4 h-4" />
                              <span className="hidden sm:inline">Not Available</span>
                              <span className="sm:hidden">Taken</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Loading State */}
        {isSearching && (
          <section className="py-12 sm:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[hsl(351,94%,48%)]/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-[hsl(351,94%,48%)] animate-spin" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Searching domains...</h3>
                <p className="text-sm sm:text-base text-gray-500 px-4">
                  Finding the perfect match for "<span className="break-all">{searchQuery}</span>"
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Globe className="w-6 h-6 text-[hsl(351,94%,48%)]" />
              <span className="text-lg font-bold bg-gradient-to-r from-[hsl(351,94%,48%)] to-[hsl(108,73%,44%)] bg-clip-text text-transparent">
                .KE ZONE
              </span>
            </div>
            <p className="text-gray-500">Find the perfect domain for your brand</p>
          </div>
        </div>
      </footer>

      {/* Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DomainSearch;
