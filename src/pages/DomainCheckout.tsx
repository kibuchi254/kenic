//// Enhanced DomainCheckout Component with Live Pricing Integration
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMoneyBill, FaCreditCard, FaPaypal } from "react-icons/fa";
import { MdDomain, MdSecurity, MdSupport } from "react-icons/md";
import { CheckCircle, ArrowLeft, Shield, Clock, Users, Loader2, Info, DollarSign } from "lucide-react";
import { useAuth } from '@/context/AuthContext';

const BASE_URL = 'https://api.digikenya.co.ke';
const CONSOLE_URL = 'https://console.digikenya.co.ke';

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

interface CheckoutState {
  domain: string;
  price: number;
  renewal: number;
  isQuickCheckout: boolean;
  registrar?: string;
  extension?: Record<string, any>;
  pricing?: DomainPricing;
  returnUrl?: string;
}

const DomainCheckout: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [registrationYears, setRegistrationYears] = useState(1);
  const [showPricingBreakdown, setShowPricingBreakdown] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "KE",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, accessToken, isAuthenticated, isLoading, refreshToken } = useAuth();
  const urlParams = new URLSearchParams(location.search);
  const urlDomain = urlParams.get('domain') || 'myawesomebrand.co.ke';

  const [checkoutState, setCheckoutState] = useState<CheckoutState>(() => {
    const defaultState: CheckoutState = {
      domain: urlDomain,
      price: 1500,
      renewal: 1500,
      isQuickCheckout: false,
    };

    if (location.state) {
      const state = location.state as Partial<CheckoutState>;
      if (state.domain) {
        return {
          ...defaultState,
          ...state,
          price: state.price ?? defaultState.price,
          renewal: state.renewal ?? defaultState.renewal,
          isQuickCheckout: state.isQuickCheckout ?? defaultState.isQuickCheckout,
        };
      }
    }

    const pendingCheckout = sessionStorage.getItem('pendingCheckout');
    if (pendingCheckout) {
      try {
        const parsedData = JSON.parse(pendingCheckout) as Partial<CheckoutState>;
        sessionStorage.removeItem('pendingCheckout');
        if (parsedData.domain) {
          return {
            ...defaultState,
            ...parsedData,
            price: parsedData.price ?? defaultState.price,
            renewal: parsedData.renewal ?? defaultState.renewal,
            isQuickCheckout: parsedData.isQuickCheckout ?? defaultState.isQuickCheckout,
          };
        }
      } catch (error) {
        console.error('Error parsing pendingCheckout:', error);
      }
    }

    return defaultState;
  });

  const { domain, price, renewal, isQuickCheckout, registrar, extension, pricing } = checkoutState;

  // Calculate pricing based on live pricing data and selected years
  const getYearlyPrice = (years: number): number => {
    if (!pricing) return price * years;

    const yearKey = `${years}_year${years > 1 ? 's' : ''}` as keyof typeof pricing.registration;
    const yearlyPrice = pricing.registration[yearKey];

    if (yearlyPrice) return yearlyPrice;

    const basePrice = pricing.registration['1_year'] || price;
    return basePrice * years;
  };

  const currentPrice = getYearlyPrice(registrationYears);
  const setupFee = pricing?.setup_fee || 0;
  const taxRate = 0.16;
  const subtotal = currentPrice + setupFee;
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;

  // Format price display
  const formatPrice = (amount: number): string => {
    return `KSh ${amount.toLocaleString()}`;
  };

  // Get savings compared to yearly payments
  const getSavings = (years: number): number => {
    if (years <= 1 || !pricing) return 0;
    const yearlyTotal = (pricing.registration['1_year'] || price) * years;
    const multiYearPrice = getYearlyPrice(years);
    return Math.max(0, yearlyTotal - multiYearPrice);
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const checkoutData: CheckoutState = {
        domain,
        price,
        renewal,
        isQuickCheckout,
        registrar,
        extension,
        pricing,
        returnUrl: window.location.pathname + window.location.search
      };
      sessionStorage.setItem('pendingCheckout', JSON.stringify(checkoutData));
      navigate('/signin?return=checkout&domain=' + encodeURIComponent(domain));
    }
  }, [isAuthenticated, isLoading, navigate, domain, price, renewal, isQuickCheckout, registrar, extension, pricing]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        organization: user.company || "",
        country: user.billing_country || "KE",
      }));
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const trimmedData = {
      fullName: formData.fullName?.trim() || '',
      email: formData.email?.trim() || '',
      phone: formData.phone?.trim() || '',
      address: formData.address?.trim() || '',
      city: formData.city?.trim() || '',
      state: formData.state?.trim() || '',
      postalCode: formData.postalCode?.trim() || ''
    };

    if (!trimmedData.fullName) newErrors.fullName = 'Full name is required';

    if (!trimmedData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!trimmedData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (trimmedData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!trimmedData.address) newErrors.address = 'Address is required';
    if (!trimmedData.city) newErrors.city = 'City is required';
    if (!trimmedData.state) newErrors.state = 'State/Province is required';
    if (!trimmedData.postalCode) newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || firstName;
    return { firstName, lastName };
  };

  const getAuthToken = (): string | null => {
    const authToken = accessToken || token;
    return authToken;
  };

  const debugAuthHeaders = (): void => {
    const authToken = getAuthToken();
    const cookies = document.cookie;

    console.log('Current auth state:', {
      token: authToken ? authToken.substring(0, 20) + '...' : 'MISSING',
      cookies: cookies || 'NONE',
      localStorage: {
        session_token: localStorage.getItem('session_token') ? 'EXISTS' : 'MISSING',
        access_token: localStorage.getItem('access_token') ? 'EXISTS' : 'MISSING',
        user: localStorage.getItem('user') ? 'EXISTS' : 'MISSING'
      },
      sessionStorage: {
        auth_code: sessionStorage.getItem('auth_code') ? 'EXISTS' : 'MISSING'
      }
    });
  };

  const registerDomain = async (): Promise<any> => {
    debugAuthHeaders();
    const { firstName, lastName } = splitFullName(formData.fullName);
    const registrationData = {
      domain,
      years: registrationYears,
      auto_renew: true,
      privacy_protection: false,
      dns_management: true,
      email_forwarding: false,
      nameservers: [],
      contacts: {
        registrant: {
          first_name: firstName,
          last_name: lastName,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          organization: formData.organization?.trim() || '',
          address1: formData.address.trim(),
          address2: '',
          city: formData.city.trim(),
          state: formData.state.trim(),
          postal_code: formData.postalCode.trim(),
          country: formData.country,
        },
        admin: {
          first_name: firstName,
          last_name: lastName,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          organization: formData.organization?.trim() || "",
          address1: formData.address.trim(),
          address2: "",
          city: formData.city.trim(),
          state: formData.state.trim(),
          postal_code: formData.postalCode.trim(),
          country: formData.country
        },
        tech: {
          first_name: firstName,
          last_name: lastName,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          organization: formData.organization?.trim() || "",
          address1: formData.address.trim(),
          address2: "",
          city: formData.city.trim(),
          state: formData.state.trim(),
          postal_code: formData.postalCode.trim(),
          country: formData.country
        }
      }
    };

    const authToken = getAuthToken();
    if (!authToken) {
      throw new Error('Authentication token missing. Please sign in again.');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BASE_URL}/api/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        credentials: 'include',
        body: JSON.stringify(registrationData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (response.ok && result.success) {
        return result;
      } else {
        throw new Error(result.message || 'Domain registration failed');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      }

      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }

      if (error.message.includes('401') || error.message.includes('Authentication')) {
        try {
          const refreshed = await refreshToken();
          if (refreshed) {
            const newAuthToken = getAuthToken();
            if (!newAuthToken) {
              throw new Error('Authentication token missing after refresh');
            }

            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), 30000);

            const retryResponse = await fetch(`${BASE_URL}/api/v1/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${newAuthToken}`,
              },
              credentials: 'include',
              body: JSON.stringify(registrationData),
              signal: retryController.signal,
            });

            clearTimeout(retryTimeoutId);
            const retryResult = await retryResponse.json();

            if (retryResponse.ok && retryResult.success) {
              return retryResult;
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }

      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  };

  const handleCheckout = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!isAuthenticated) {
      setErrors({ api: 'Please sign in to complete the registration.' });
      navigate('/signin?return=checkout&domain=' + encodeURIComponent(domain));
      return;
    }

    setIsProcessing(true);
    setErrors({});

    try {
      setProcessingStep("Processing payment...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      setProcessingStep("Registering domain...");
      const registrationResult = await registerDomain();

      if (!registrationResult.success) {
        throw new Error(registrationResult.message || 'Domain registration failed');
      }

      setProcessingStep("Registration complete! Redirecting...");
      sessionStorage.removeItem('pendingCheckout');

      setTimeout(() => {
        window.location.href = `${CONSOLE_URL}/domains?new=${encodeURIComponent(domain)}`;
      }, 2000);
    } catch (error: any) {
      let errorMessage = 'An error occurred during registration. Please try again or contact support.';

      if (error.message.includes('Authentication')) {
        errorMessage = 'Authentication failed. Please sign in again.';
        setTimeout(() => {
          navigate('/signin?return=checkout&domain=' + encodeURIComponent(domain));
        }, 2000);
      } else if (error.message.includes('Invalid authentication credentials')) {
        errorMessage = 'Your session has expired. Please sign in again.';
        setTimeout(() => {
          navigate('/signin?return=checkout&domain=' + encodeURIComponent(domain));
        }, 2000);
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ api: errorMessage });
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {processingStep || "Processing..."}
            </h2>
            <p className="text-gray-600 mb-6">Please wait while we complete your domain registration.</p>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Payment Processing</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between">
                <span>Domain Registration</span>
                {processingStep.includes("Registering") || processingStep.includes("complete") ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full border-t-primary animate-spin"></div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Account Setup</span>
                {processingStep.includes("complete") ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Domain Registration</h1>
            <p className="text-gray-600">
              Registering {domain} for {user?.name || 'your account'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Domain Summary with Live Pricing */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-primary">
                  <MdDomain size={28} />
                  Domain Summary
                </h2>
                <div className="flex items-center space-x-2">
                  {isQuickCheckout && (
                    <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                      QUICK CHECKOUT
                    </div>
                  )}
                  {pricing?.source && (
                    <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                      {pricing.source === 'whmcs' ? 'LIVE PRICING' : 'ESTIMATED'}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xl font-bold text-gray-900">{domain}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Available</span>
                      </span>
                      <span>{registrationYears} Year{registrationYears > 1 ? 's' : ''} Registration</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{formatPrice(currentPrice)}</p>
                    {setupFee > 0 && (
                      <p className="text-xs text-gray-500">+ {formatPrice(setupFee)} setup</p>
                    )}
                  </div>
                </div>

                {/* Registration Period Selector */}
                <div className="border-t border-primary/20 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Registration Period:</span>
                    <button
                      onClick={() => setShowPricingBreakdown(!showPricingBreakdown)}
                      className="text-xs text-primary hover:text-primary/80 flex items-center space-x-1"
                    >
                      <Info className="w-3 h-3" />
                      <span>View Pricing</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((years) => (
                      <button
                        key={years}
                        type="button"
                        onClick={() => setRegistrationYears(years)}
                        className={`p-2 rounded-lg text-sm font-medium transition-all ${
                          registrationYears === years
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div>{years} Year{years > 1 ? 's' : ''}</div>
                        <div className="text-xs opacity-75">
                          {formatPrice(getYearlyPrice(years))}
                        </div>
                        {getSavings(years) > 0 && (
                          <div className="text-xs text-green-600">
                            Save {formatPrice(getSavings(years))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              {showPricingBreakdown && pricing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Live Pricing Details</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">Registration Pricing</h5>
                      <div className="space-y-1 text-blue-700">
                        {pricing.registration['1_year'] && (
                          <div className="flex justify-between">
                            <span>1 Year:</span>
                            <span>{formatPrice(pricing.registration['1_year'])}</span>
                          </div>
                        )}
                        {pricing.registration['2_years'] && (
                          <div className="flex justify-between">
                            <span>2 Years:</span>
                            <span>{formatPrice(pricing.registration['2_years'])}</span>
                          </div>
                        )}
                        {pricing.registration['3_years'] && (
                          <div className="flex justify-between">
                            <span>3 Years:</span>
                            <span>{formatPrice(pricing.registration['3_years'])}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">Renewal Pricing</h5>
                      <div className="space-y-1 text-blue-700">
                        {pricing.renewal['1_year'] && (
                          <div className="flex justify-between">
                            <span>Per Year:</span>
                            <span>{formatPrice(pricing.renewal['1_year'])}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Setup Fee:</span>
                          <span>{formatPrice(setupFee)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div className="flex flex-col items-center space-y-1">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-gray-600">Instant Setup</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-gray-600">DNS Included</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-gray-600">24/7 Support</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-primary mb-6">Registrant Contact Information</h2>

              {errors.api && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-600 text-sm">{errors.api}</div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                      errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+254700000000"
                    required
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="My Company"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St"
                    required
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                      errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Nairobi"
                    required
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                      errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Nairobi"
                    required
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                      errors.state ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="00100"
                    required
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                      errors.postalCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.postalCode && <p className="text-red-600 text-sm mt-1">{errors.postalCode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="KE">Kenya</option>
                    <option value="UG">Uganda</option>
                    <option value="TZ">Tanzania</option>
                    <option value="RW">Rwanda</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                  </select>
                </div>
              </div>

              <h2 className="text-xl font-bold text-primary mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mpesa")}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === "mpesa" ? "border-primary bg-primary/5 shadow-md" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <FaMoneyBill size={28} className={paymentMethod === "mpesa" ? "text-primary" : "text-gray-500"} />
                  <span className="mt-2 font-medium">M-Pesa</span>
                  <span className="text-xs text-gray-500">Mobile Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === "card" ? "border-primary bg-primary/5 shadow-md" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <FaCreditCard size={28} className={paymentMethod === "card" ? "text-primary" : "text-gray-500"} />
                  <span className="mt-2 font-medium">Card</span>
                  <span className="text-xs text-gray-500">Visa, Mastercard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === "paypal" ? "border-primary bg-primary/5 shadow-md" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <FaPaypal size={28} className={paymentMethod === "paypal" ? "text-primary" : "text-gray-500"} />
                  <span className="mt-2 font-medium">PayPal</span>
                  <span className="text-xs text-gray-500">Digital Wallet</span>
                </button>
              </div>

              <div className="mb-6">
                <label className="flex items-start space-x-2">
                  <input type="checkbox" required className="mt-1 text-primary" />
                  <span className="text-sm text-gray-600">
                    I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and
                    <a href="#" className="text-primary hover:underline"> Privacy Policy</a>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-4 rounded-xl font-bold text-lg shadow-lg hover:from-primary/90 hover:to-primary/70 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  `Complete Registration - ${formatPrice(total)}`
                )}
              </button>
            </form>
          </div>

          {/* Enhanced Order Summary with Live Pricing */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 sticky top-4">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Order Summary</span>
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Domain Registration ({registrationYears} year{registrationYears > 1 ? 's' : ''})</span>
                  <span>{formatPrice(currentPrice)}</span>
                </div>
                {setupFee > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Setup Fee</span>
                    <span>{formatPrice(setupFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>VAT (16%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Live Pricing Indicator */}
              {pricing?.source && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800">
                      {pricing.source === 'whmcs' ? 'Live WHMCS Pricing' : 'Current Market Pricing'}
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Pricing updated in real-time from our system
                  </p>
                </div>
              )}

              {/* Domain Features */}
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                <p>• Domain registered for {registrationYears} year{registrationYears > 1 ? 's' : ''}</p>
                <p>• Free DNS management included</p>
                <p>• 24/7 customer support</p>
                <p>• Auto-renewal enabled</p>
                {pricing?.renewal?.['1_year'] && (
                  <p>• Renewal: {formatPrice(pricing.renewal['1_year'])}/year</p>
                )}
              </div>

              {/* Multi-year Savings */}
              {getSavings(registrationYears) > 0 && (
                <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-primary font-medium">
                      You save {formatPrice(getSavings(registrationYears))} with {registrationYears}-year registration
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <MdSecurity className="w-5 h-5 text-primary mr-2" />
                Secure Registration
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>SSL Encrypted Connection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Secure Payment Processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>KENIC Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Data Privacy Protected</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <MdSupport className="w-5 h-5 text-primary mr-2" />
                Need Help?
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Live Chat</p>
                  <p className="text-gray-600">Available 24/7 for instant support</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email Support</p>
                  <p className="text-gray-600">support@digikenya.co.ke</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Phone Support</p>
                  <p className="text-gray-600">+254 700 000 000</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Benefits Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Why Choose DigitalKenya Registration?</h3>
            <p className="text-gray-600">Trusted by thousands with live WHMCS integration</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-gray-900">Instant Activation</h4>
              <p className="text-sm text-gray-600">Your domain is active immediately after registration</p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-gray-900">Live Pricing</h4>
              <p className="text-sm text-gray-600">Real-time pricing from WHMCS with no hidden fees</p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-gray-900">Local Support</h4>
              <p className="text-sm text-gray-600">24/7 Kenyan customer support team</p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-gray-900">KENIC Accredited</h4>
              <p className="text-sm text-gray-600">Official registrar with full compliance</p>
            </div>
          </div>
        </div>

        {/* Pricing Transparency Notice */}
        {pricing && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h4 className="font-semibold text-blue-900 mb-1">Live Pricing Information</h4>
                <p className="text-blue-800">
                  This checkout uses live pricing from our WHMCS system ({pricing.source}).
                  Prices include all applicable taxes and fees. Multi-year registrations may offer savings.
                  Your renewal rate will be {formatPrice(pricing.renewal?.['1_year'] || currentPrice)} per year.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainCheckout;
