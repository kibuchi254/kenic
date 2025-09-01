import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMoneyBill, FaCreditCard, FaPaypal } from "react-icons/fa";
import { MdDomain, MdSecurity, MdSupport } from "react-icons/md";
import { CheckCircle, ArrowLeft, Shield, Clock, Users, Loader2 } from "lucide-react";
import { useAuth } from '@/context/AuthContext';

const BASE_URL = 'https://api.digikenya.co.ke';
const CONSOLE_URL = 'https://console.digikenya.co.ke';

export default function DomainCheckout() {
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
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
  const [errors, setErrors] = useState({});

  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading } = useAuth();

  // Initialize checkout state from location.state or sessionStorage
  const [checkoutState, setCheckoutState] = useState(() => {
    console.log('DomainCheckout: Initializing checkout state');
    // First, try to get data from location.state
    if (location.state) {
      console.log('DomainCheckout: Using location.state:', location.state);
      return location.state;
    }
    // Fallback to sessionStorage
    const pendingCheckout = sessionStorage.getItem('pendingCheckout');
    if (pendingCheckout) {
      try {
        const parsedData = JSON.parse(pendingCheckout);
        console.log('DomainCheckout: Restored checkout state from sessionStorage:', parsedData);
        // Clean up sessionStorage immediately to prevent reuse
        sessionStorage.removeItem('pendingCheckout');
        return parsedData;
      } catch (error) {
        console.error('DomainCheckout: Error parsing pendingCheckout:', error);
      }
    }
    // Default values if neither is available
    console.log('DomainCheckout: Falling back to default checkout state');
    return {
      domain: "myawesomebrand.co.ke",
      price: 1200,
      renewal: 1200,
      isQuickCheckout: false,
    };
  });

  const { 
    domain, 
    price, 
    renewal, 
    isQuickCheckout,
    registrar,
    extension 
  } = checkoutState;

  const taxRate = 0.16;
  const tax = Math.round(price * taxRate);
  const total = price + tax;

  // Log the initialized checkout state
  useEffect(() => {
    console.log('DomainCheckout: Initialized checkout state:', checkoutState);
  }, [checkoutState]);

  // Check authentication status and redirect if needed
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('DomainCheckout: User not authenticated, redirecting to signin');
      // Store the current checkout data in sessionStorage for after login
      const checkoutData = {
        domain,
        price,
        renewal,
        isQuickCheckout,
        registrar,
        extension,
        returnUrl: window.location.pathname + window.location.search
      };
      console.log('DomainCheckout: Storing checkout data in sessionStorage:', checkoutData);
      sessionStorage.setItem('pendingCheckout', JSON.stringify(checkoutData));
      
      // Redirect to signin with a return parameter
      navigate('/signin?return=checkout&domain=' + encodeURIComponent(domain));
    }
  }, [isAuthenticated, isLoading, navigate, domain, price, renewal, isQuickCheckout, registrar, extension]);

  // Pre-fill form with user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('DomainCheckout: Pre-filling form with user data:', user);
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State/Province is required';
    }
    
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const splitFullName = (fullName: string) => {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || firstName; // Use first name as last name if only one name provided
    return { firstName, lastName };
  };

  const registerDomain = async () => {
    if (!token) {
      console.error('DomainCheckout: No authentication token available');
      throw new Error('Authentication token is missing. Please sign in again.');
    }

    const { firstName, lastName } = splitFullName(formData.fullName);
    
    const registrationData = {
      domain: domain,
      years: 1,
      auto_renew: true,
      privacy_protection: false,
      dns_management: true,
      email_forwarding: false,
      nameservers: [], // Will use default nameservers
      contacts: {
        registrant: {
          first_name: firstName,
          last_name: lastName,
          email: formData.email,
          phone: formData.phone,
          organization: formData.organization || "",
          address1: formData.address,
          address2: "",
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country
        },
        admin: {
          first_name: firstName,
          last_name: lastName,
          email: formData.email,
          phone: formData.phone,
          organization: formData.organization || "",
          address1: formData.address,
          address2: "",
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country
        },
        tech: {
          first_name: firstName,
          last_name: lastName,
          email: formData.email,
          phone: formData.phone,
          organization: formData.organization || "",
          address1: formData.address,
          address2: "",
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country
        }
      }
    };

    console.log('DomainCheckout: Sending domain registration request:', registrationData);

    try {
      const response = await fetch(`${BASE_URL}/api/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('DomainCheckout: Registration failed:', result);
        throw new Error(result.detail || `Registration failed with status: ${response.status}`);
      }

      console.log('DomainCheckout: Registration response:', result);
      return result;
    } catch (error) {
      console.error('DomainCheckout: Registration error:', error);
      throw error;
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('DomainCheckout: Form validation failed:', errors);
      return;
    }

    if (!isAuthenticated || !token) {
      console.error('DomainCheckout: User not authenticated or token missing');
      setErrors({ api: 'Please sign in to complete the registration.' });
      navigate('/signin?return=checkout&domain=' + encodeURIComponent(domain));
      return;
    }

    setIsProcessing(true);
    setErrors({});

    try {
      // Step 1: Process Payment (Mock for now)
      setProcessingStep("Processing payment...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate payment processing
      console.log('DomainCheckout: Payment processing completed');

      // Step 2: Register Domain
      setProcessingStep("Registering domain...");
      const registrationResult = await registerDomain();
      
      if (!registrationResult.success) {
        throw new Error(registrationResult.message || 'Domain registration failed');
      }

      // Step 3: Success - redirect to console
      setProcessingStep("Registration complete! Redirecting...");
      console.log('DomainCheckout: Registration successful, redirecting to console');
      
      // Clear any cached data
      sessionStorage.removeItem('pendingCheckout');
      
      // Redirect to console domains page
      setTimeout(() => {
        window.location.href = `${CONSOLE_URL}/domains?new=${encodeURIComponent(domain)}`;
      }, 2000);

    } catch (error) {
      console.error('DomainCheckout: Checkout error:', error);
      setErrors({ 
        api: error.message || 'An error occurred during registration. Please try again or contact support.' 
      });
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show processing overlay
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
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
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full border-t-green-600 animate-spin"></div>
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

  // Don't render the form if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Domain Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-green-600">
                  <MdDomain size={28} /> 
                  Domain Summary
                </h2>
                {isQuickCheckout && (
                  <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                    QUICK CHECKOUT
                  </div>
                )}
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-gray-900">{domain}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Available</span>
                      </span>
                      <span>1 Year Registration</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">KES {price.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Renewal: KES {renewal.toLocaleString()}/year</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs">
                <div className="flex flex-col items-center space-y-1">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">Instant Setup</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">DNS Included</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Contact Information Form */}
            <form onSubmit={handleCheckout} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-green-600 mb-6">Registrant Contact Information</h2>
              
              {errors.api && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <div className="text-red-600 text-sm">{errors.api}</div>
                  </div>
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
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+254700000000"
                    required
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization (Optional)
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="Company Name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    required
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
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
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
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
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
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
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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

              {/* Payment Method Selection */}
              <h2 className="text-xl font-bold text-green-600 mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mpesa")}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === "mpesa" 
                      ? "border-green-500 bg-green-50 shadow-md" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <FaMoneyBill size={28} className={paymentMethod === "mpesa" ? "text-green-600" : "text-gray-500"} />
                  <span className="mt-2 font-medium">M-Pesa</span>
                  <span className="text-xs text-gray-500">Mobile Money</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === "card" 
                      ? "border-green-500 bg-green-50 shadow-md" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <FaCreditCard size={28} className={paymentMethod === "card" ? "text-green-600" : "text-gray-500"} />
                  <span className="mt-2 font-medium">Card</span>
                  <span className="text-xs text-gray-500">Visa, Mastercard</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === "paypal" 
                      ? "border-green-500 bg-green-50 shadow-md" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <FaPaypal size={28} className={paymentMethod === "paypal" ? "text-green-600" : "text-gray-500"} />
                  <span className="mt-2 font-medium">PayPal</span>
                  <span className="text-xs text-gray-500">Digital Wallet</span>
                </button>
              </div>

              {/* Terms and Submit */}
              <div className="mb-6">
                <label className="flex items-start space-x-2">
                  <input type="checkbox" required className="mt-1 text-green-600" />
                  <span className="text-sm text-gray-600">
                    I agree to the <a href="#" className="text-green-600 hover:underline">Terms of Service</a> and 
                    <a href="#" className="text-green-600 hover:underline"> Privacy Policy</a>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  `Complete Registration - KES ${total.toLocaleString()}`
                )}
              </button>
            </form>
          </div>

          {/* Right Column - Order Summary & Security */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 sticky top-4">
              <h2 className="text-xl font-bold text-green-600 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Domain Registration</span>
                  <span>KES {price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>VAT (16%)</span>
                  <span>KES {tax.toLocaleString()}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span>KES {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                <p>• Domain registered for 1 year</p>
                <p>• Free DNS management included</p>
                <p>• 24/7 customer support</p>
                <p>• Auto-renewal enabled</p>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <MdSecurity className="w-5 h-5 text-green-600 mr-2" />
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
                  <span>ICANN Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Data Privacy Protected</span>
                </div>
              </div>
            </div>

            {/* Support Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <MdSupport className="w-5 h-5 text-green-600 mr-2" />
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

        {/* Trust Indicators */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Why Choose Our Domain Registration?</h3>
            <p className="text-gray-600">Trusted by thousands of customers worldwide</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Instant Activation</h4>
              <p className="text-sm text-gray-600">Your domain is active immediately after registration</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Secure Registration</h4>
              <p className="text-sm text-gray-600">Bank-level security for all transactions</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Expert Support</h4>
              <p className="text-sm text-gray-600">24/7 customer support from domain experts</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Money-Back Guarantee</h4>
              <p className="text-sm text-gray-600">30-day guarantee for peace of mind</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}