import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, Mail, ExternalLink, CreditCard, Zap, CheckCircle } from 'lucide-react';
import truehostLogo from '../assets/truehost.png';
import hospinaccle from '../assets/hospinnacle.png';
import novahost from '../assets/novahost.png';
import webhost from '../assets/webhost.webp';

interface Registrar {
  id: string;
  name: string;
  logo?: string;
  contactPhone: string;
  contactEmail: string;
  website?: string;
}

const mockRegistrars: Registrar[] = [
  {
    id: 'truehost',
    name: 'Truehost Cloud',
    logo: truehostLogo,
    contactPhone: '+254207903111',
    contactEmail: 'accounts@truehost.cloud',
    website: 'https://truehost.cloud',
  },
  {
    id: 'hostpinnacle',
    name: 'HostPinnacle',
    logo: hospinaccle,
    contactPhone: '+254700123456',
    contactEmail: 'support@hostpinnacle.co.ke',
    website: 'https://hostpinnacle.co.ke',
  },
  {
    id: 'webhost',
    name: 'WebHost',
    logo: webhost,
    contactPhone: '+254711234567',
    contactEmail: 'info@webhostkenya.co.ke',
    website: 'https://webhostkenya.co.ke',
  },
  {
    id: 'novahost',
    name: 'Novahost',
    logo: novahost,
    contactPhone: '+254711234567',
    contactEmail: 'info@novahostkenya.co.ke',
    website: 'https://novahostkenya.co.ke',
  },
];

export const RegistrarsSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRegistrar, setSelectedRegistrar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get domain details from navigation state
  const { domain, price: domainPrice, extension } = location.state || {};

  useEffect(() => {
    // Redirect back if no domain information is provided
    if (!domain) {
      navigate('/');
    }
  }, [domain, navigate]);

  const handleQuickCheckout = () => {
    setIsLoading(true);
    
    // Simulate processing delay
    setTimeout(() => {
      navigate('/domain-checkout', {
        state: {
          domain,
          price: 1200,
          renewal: 1200,
          extension,
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
      // Open registrar website in new tab
      if (registrar.website) {
        window.open(registrar.website, '_blank');
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
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Choose Your Option</h1>
              <p className="text-gray-600">
                Register <span className="font-semibold text-green-600">{domain}</span> quickly or choose a trusted registrar
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Domain Info Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{domain}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Available</span>
                </span>
                <span>{extension?.desc}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Starting from</p>
              <p className="text-2xl font-bold text-green-600">KES 1,200/year</p>
            </div>
          </div>
        </div>

        {/* Quick Checkout + Registrars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Checkout Card - Featured */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl border-2 border-green-400 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex flex-col h-full">
              {/* Header with Icon */}
              <div className="mb-4 text-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
                  RECOMMENDED
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-center mb-3">Quick Checkout</h3>
              
              {/* Features */}
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-200" />
                  <span>Instant Registration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-200" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-200" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-200" />
                  <span>Free DNS Management</span>
                </div>
              </div>

              {/* Price */}
              <div className="text-center mb-4">
                <div className="text-2xl font-bold">KES 1,200</div>
                <div className="text-sm text-green-100">per year</div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleQuickCheckout}
                disabled={isLoading}
                className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center space-x-2 w-full disabled:opacity-50 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Checkout Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* External Registrars */}
          {mockRegistrars.map((registrar) => (
            <div
              key={registrar.id}
              className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-green-300 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col h-full">
                {/* Header with Logo */}
                <div className="mb-4">
                  <img
                    src={registrar.logo}
                    alt={`${registrar.name} logo`}
                    className="w-full h-24 object-contain rounded-lg"
                  />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 text-center mb-4">{registrar.name}</h3>

                {/* Contact Info */}
                <div className="space-y-3 mb-6 text-xs text-gray-600 flex-grow">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3 h-3 text-green-600" />
                    <span>{registrar.contactPhone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3 h-3 text-green-600" />
                    <span className="break-all">{registrar.contactEmail}</span>
                  </div>
                </div>

                {/* Visit Website Button */}
                <button
                  onClick={() => handleProceedToRegistrar(registrar)}
                  disabled={isLoading}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2 w-full disabled:opacity-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit Website</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Why Choose Quick Checkout?</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Instant Setup</h4>
              <p>Your domain will be ready immediately after payment confirmation. No waiting periods or manual processing.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Competitive Pricing</h4>
              <p>Get the same domain at competitive rates with transparent pricing and no hidden fees.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Full Support</h4>
              <p>Our dedicated support team is available 24/7 to help you with any domain-related questions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrarsSelectionPage;