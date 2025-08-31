import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, Mail, ExternalLink } from 'lucide-react';
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
  website?: string; // Added to support website URL
}

const mockRegistrars: Registrar[] = [
  {
    id: 'truehost',
    name: 'Truehost Cloud',
    logo: truehostLogo,
    contactPhone: '+254207903111',
    contactEmail: 'accounts@truehost.cloud',
    website: 'https://truehost.cloud', // Example website URL
  },
  {
    id: 'hostpinnacle',
    name: 'HostPinnacle',
    logo: hospinaccle,
    contactPhone: '+254700123456',
    contactEmail: 'support@hostpinnacle.co.ke',
    website: 'https://hostpinnacle.co.ke', // Example website URL
  },
  {
    id: 'webhost',
    name: 'WebHost',
    logo: webhost,
    contactPhone: '+254711234567',
    contactEmail: 'info@webhostkenya.co.ke',
    website: 'https://webhostkenya.co.ke', // Example website URL
  },
  {
    id: 'novahost',
    name: 'Novahost',
    logo: novahost,
    contactPhone: '+254711234567',
    contactEmail: 'info@novahostkenya.co.ke',
    website: 'https://novahostkenya.co.ke', // Example website URL
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

  const handleProceedToCheckout = async (registrar: Registrar) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      navigate('/domain-checkout', {
        state: {
          domain,
          price: 1200,
          registrar,
          extension,
        },
      });
      setIsLoading(false);
    }, 500);
  };

  if (!domain) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Domain Selected</h2>
          <p className="text-gray-600 mb-4">Please select a domain first</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
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
              <h1 className="text-2xl font-bold text-gray-900">Choose Your Registrar</h1>
              <p className="text-gray-600">
                Select a trusted registrar for <span className="font-semibold text-blue-600">{domain}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Domain Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{domain}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Available</span>
                </span>
                <span>{extension?.desc}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Starting from</p>
              <p className="text-2xl font-bold text-blue-600">KES 1200/year</p>
            </div>
          </div>
        </div>

        {/* Registrars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRegistrars.map((registrar) => (
            <div
              key={registrar.id}
              className="bg-white rounded-2xl border-2 p-6 border-gray-200 hover:border-blue-300 transition-all duration-200"
            >
              <div className="flex flex-col h-full">
                {/* Header with Uniform Logo */}
                <div className="mb-4">
                  <img
                    src={registrar.logo}
                    alt={`${registrar.name} logo`}
                    className="w-full h-32 object-contain rounded-lg"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-4">{registrar.name}</h3>

                {/* Contact Info */}
                <div className="grid grid-cols-1 gap-4 mb-4 text-xs text-gray-600">
                  <div className="flex items-center space-x-2 justify-center">
                    <Phone className="w-3 h-3" />
                    <span>{registrar.contactPhone}</span>
                  </div>
                  <div className="flex items-center space-x-2 justify-center">
                    <Mail className="w-3 h-3" />
                    <span>{registrar.contactEmail}</span>
                  </div>
                </div>

                {/* Visit Website Button */}
                <a
                  href={registrar.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2 w-full"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit Website</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegistrarsSelectionPage;