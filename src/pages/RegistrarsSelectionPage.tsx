import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, Mail, ExternalLink, CreditCard, Zap, CheckCircle, Info, DollarSign } from 'lucide-react';
import truehostLogo from '../assets/truehost.png';
import hospinaccle from '../assets/hospinnacle.png';
import novahost from '../assets/novahost.png';
import webhost from '../assets/webhost.webp';

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

interface Registrar {
  id: string;
  name: string;
  logo?: string;
  contactPhone: string;
  contactEmail: string;
  website?: string;
  features?: string[];
}

const mockRegistrars: Registrar[] = [
  {
    id: 'truehost',
    name: 'Truehost Cloud',
    logo: truehostLogo,
    contactPhone: '+254207903111',
    contactEmail: 'accounts@truehost.cloud',
    website: 'https://truehost.cloud',
    features: ['Free DNS Management', 'Email Forwarding', 'Domain Parking']
  },
  {
    id: 'hostpinnacle',
    name: 'HostPinnacle',
    logo: hospinaccle,
    contactPhone: '+254700123456',
    contactEmail: 'support@hostpinnacle.co.ke',
    website: 'https://hostpinnacle.co.ke',
    features: ['24/7 Support', 'Free Privacy Protection', 'Domain Transfer']
  },
  {
    id: 'webhost',
    name: 'WebHost',
    logo: webhost,
    contactPhone: '+254711234567',
    contactEmail: 'info@webhostkenya.co.ke',
    website: 'https://webhostkenya.co.ke',
    features: ['Web Hosting Bundle', 'SSL Certificate', 'Website Builder']
  },
  {
    id: 'novahost',
    name: 'Novahost',
    logo: novahost,
    contactPhone: '+254711234567',
    contactEmail: 'info@novahostkenya.co.ke',
    website: 'https://novahostkenya.co.ke',
    features: ['Cloud Hosting', 'Auto Renewal', 'Domain Management Panel']
  },
];

export const RegistrarsSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRegistrar, setSelectedRegistrar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPricingDetails, setShowPricingDetails] = useState(false);

  // Get domain details from navigation state with enhanced pricing info
  const { domain, price: domainPrice, extension, pricing } = location.state || {};

  useEffect(() => {
    // Redirect back if no domain information is provided
    if (!domain) {
      navigate('/');
    }
  }, [domain, navigate]);

  // Format pricing display
  const formatPrice = (amount: number | undefined): string => {
    if (!amount) return 'Contact for pricing';
    return `KSh ${amount.toLocaleString()}`;
  };

  // Get the actual registration price from pricing data
  const getRegistrationPrice = (): number => {
    if (pricing?.registration?.['1_year']) {
      return pricing.registration['1_year'];
    }
    if (domainPrice && typeof domainPrice === 'number') {
      return domainPrice;
    }
    // Fallback price
    return 1500;
  };

  // Get the actual renewal price from pricing data
  const getRenewalPrice = (): number => {
    if (pricing?.renewal?.['1_year']) {
      return pricing.renewal['1_year'];
    }
    // Fallback to registration price
    return getRegistrationPrice();
  };

  const handleQuickCheckout = () => {
    setIsLoading(true);
    
    // Simulate processing delay
    setTimeout(() => {
      navigate('/domain-checkout', {
        state: {
          domain,
          price: getRegistrationPrice(),
          renewal: getRenewalPrice(),
          extension,
          pricing,
          isQuickCheckout: true,
        },
      });
      setIsLoading(false);
    }, 300);
  };

  const handleProceedToRegistrar = async (registrar: Registrar) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Open registrar website in new tab with domain info
      if (registrar.website) {
        const url = new URL(registrar.website);
        // Some registrars accept domain as a query parameter
        url.searchParams.set('domain', domain);
        window.open(url.toString(), '_blank');
      }
      setIsLoading(false);
    }, 500);
  };

  if (!domain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Domain Selected</h2>
          <p className="text-gray-600 mb-4">Please select a domain first</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Choose Your Registration Option</h1>
              <p className="text-gray-600">
                Register <span className="font-semibold text-primary">{domain}</span> with live pricing
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Domain Info Banner with Live Pricing */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{domain}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <span className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Available</span>
                </span>
                <span>{extension?.desc}</span>
              </div>
              {pricing?.source && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {pricing.source === 'whmcs' ? 'Live Pricing' : 'Estimated Price'}
                  </span>
                  <button
                    onClick={() => setShowPricingDetails(!showPricingDetails)}
                    className="text-xs text-primary hover:text-primary/80 flex items-center space-x-1"
                  >
                    <Info className="w-3 h-3" />
                    <span>Pricing Details</span>
                  </button>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Registration Price</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(getRegistrationPrice())}/year</p>
              {getRenewalPrice() !== getRegistrationPrice() && (
                <p className="text-sm text-gray-600 mt-1">
                  Renewal: {formatPrice(getRenewalPrice())}/year
                </p>
              )}
            </div>
          </div>

          {/* Pricing Details Dropdown */}
          {showPricingDetails && pricing && (
            <div className="mt-4 pt-4 border-t border-primary/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Registration Pricing</h4>
                  <div className="space-y-1 text-gray-600">
                    {pricing.registration['1_year'] && (
                      <div className="flex justify-between">
                        <span>1 Year:</span>
                        <span className="font-medium">{formatPrice(pricing.registration['1_year'])}</span>
                      </div>
                    )}
                    {pricing.registration['2_years'] && (
                      <div className="flex justify-between">
                        <span>2 Years:</span>
                        <span className="font-medium">{formatPrice(pricing.registration['2_years'])}</span>
                      </div>
                    )}
                    {pricing.registration['3_years'] && (
                      <div className="flex justify-between">
                        <span>3 Years:</span>
                        <span className="font-medium">{formatPrice(pricing.registration['3_years'])}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Renewal Pricing</h4>
                  <div className="space-y-1 text-gray-600">
                    {pricing.renewal['1_year'] && (
                      <div className="flex justify-between">
                        <span>1 Year:</span>
                        <span className="font-medium">{formatPrice(pricing.renewal['1_year'])}</span>
                      </div>
                    )}
                    {pricing.renewal['2_years'] && (
                      <div className="flex justify-between">
                        <span>2 Years:</span>
                        <span className="font-medium">{formatPrice(pricing.renewal['2_years'])}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Additional Fees</h4>
                  <div className="space-y-1 text-gray-600">
                    <div className="flex justify-between">
                      <span>Setup Fee:</span>
                      <span className="font-medium">{formatPrice(pricing.setup_fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Currency:</span>
                      <span className="font-medium">{pricing.currency}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Quick Checkout + Registrars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Enhanced Quick Checkout Card */}
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl border-2 border-primary p-6 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex flex-col h-full">
              {/* Header with Icon */}
              <div className="mb-4 text-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-10 h-10 text-primary-foreground" />
                </div>
                <div className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
                  RECOMMENDED
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-center mb-3">DigitalKenya Quick Register</h3>
              
              {/* Features */}
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary-foreground/80" />
                  <span>Instant Registration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary-foreground/80" />
                  <span>Live WHMCS Pricing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary-foreground/80" />
                  <span>24/7 Local Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary-foreground/80" />
                  <span>Free DNS Management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary-foreground/80" />
                  <span>KENIC Accredited</span>
                </div>
              </div>

              {/* Live Pricing Display */}
              <div className="text-center mb-4 bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Live Price</span>
                </div>
                <div className="text-2xl font-bold">{formatPrice(getRegistrationPrice())}</div>
                <div className="text-sm text-primary-foreground/80">
                  per year {pricing?.setup_fee > 0 && `+ ${formatPrice(pricing.setup_fee)} setup`}
                </div>
                {getRenewalPrice() !== getRegistrationPrice() && (
                  <div className="text-xs text-primary-foreground/70 mt-1">
                    Renewal: {formatPrice(getRenewalPrice())}/year
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleQuickCheckout}
                disabled={isLoading}
                className="bg-white text-primary hover:bg-gray-100 px-6 py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center space-x-2 w-full disabled:opacity-50 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Register Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced External Registrars */}
          {mockRegistrars.map((registrar) => (
            <div
              key={registrar.id}
              className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col h-full">
                {/* Header with Logo */}
                <div className="mb-4">
                  <div className="w-full h-20 flex items-center justify-center mb-3">
                    <img
                      src={registrar.logo}
                      alt={`${registrar.name} logo`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 text-center mb-4">{registrar.name}</h3>

                {/* Features */}
                {registrar.features && (
                  <div className="space-y-2 mb-4">
                    {registrar.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2 mb-6 text-xs text-gray-600 flex-grow">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3 h-3 text-primary" />
                    <span>{registrar.contactPhone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3 h-3 text-primary" />
                    <span className="break-all">{registrar.contactEmail}</span>
                  </div>
                </div>

                {/* Pricing Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
                  <p className="text-xs text-gray-600 mb-1">Starting from</p>
                  <p className="text-sm font-bold text-gray-900">Contact for pricing</p>
                  <p className="text-xs text-gray-500">May vary by registrar</p>
                </div>

                {/* Visit Website Button */}
                <button
                  onClick={() => handleProceedToRegistrar(registrar)}
                  disabled={isLoading}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2 w-full disabled:opacity-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit {registrar.name}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Info Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {/* Why Choose DigitalKenya */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>Why Choose DigitalKenya?</span>
            </h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Live WHMCS Integration</h4>
                <p>Real-time pricing directly from our WHMCS system. No surprises, no hidden fees - what you see is what you pay.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Instant Registration</h4>
                <p>Your domain will be active immediately after payment confirmation. No waiting periods or manual processing delays.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Local Kenyan Support</h4>
                <p>Get help from our dedicated Kenyan support team who understand local business needs and KENIC requirements.</p>
              </div>
            </div>
          </div>

          {/* Registrar Options */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <ExternalLink className="w-5 h-5 text-primary" />
              <span>Other Registrar Options</span>
            </h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Established Partners</h4>
                <p>All listed registrars are KENIC-accredited partners with proven track records in the Kenyan market.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Additional Services</h4>
                <p>Many registrars offer bundled services like web hosting, email hosting, and website building tools.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Compare Options</h4>
                <p>Visit multiple registrars to compare pricing, features, and support options before making your decision.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Transparency Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <h4 className="font-semibold text-blue-900 mb-1">Live Pricing Information</h4>
              <p className="text-blue-800">
                Our pricing is updated in real-time from WHMCS and reflects current market rates. 
                External registrars may have different pricing structures, payment methods, and additional services.
                {pricing?.source === 'whmcs' && ' This domain shows live pricing from our system.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrarsSelectionPage;