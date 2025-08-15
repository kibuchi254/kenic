import React, { useState } from 'react';
import { 
  ArrowLeft, Shield, Eye, Database, Users, 
  FileText, Scale, Clock, Mail, Phone,
  CheckCircle, AlertTriangle, Globe, Lock,
  User, CreditCard, Server, Gavel
} from 'lucide-react';

const LegalPages = () => {
  const [currentPage, setCurrentPage] = useState('privacy'); // 'privacy' or 'terms'

  // KENIC Logo Component
  const KenicLogo = ({ className = "w-12 h-12" }) => (
    <div className={`bg-red-600 rounded-lg flex items-center justify-center ${className}`}>
      <span className="text-white font-bold text-lg">.KE</span>
    </div>
  );

  const SectionCard = ({ icon: Icon, title, children, className = "" }) => (
    <div className={`bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200 ${className}`}>
      <div className="flex items-start space-x-3 mb-4">
        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <Icon className="h-5 w-5 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 flex-1">{title}</h3>
      </div>
      <div className="text-gray-700 space-y-3">
        {children}
      </div>
    </div>
  );

  const ContactInfo = () => (
    <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
      <div className="space-y-3">
        <div className="flex items-center space-x-3 text-gray-700">
          <Mail className="h-5 w-5 text-red-600" />
          <span>legal@kezone.co.ke</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-700">
          <Phone className="h-5 w-5 text-red-600" />
          <span>+254 700 000 000</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-700">
          <Globe className="h-5 w-5 text-red-600" />
          <span>Nairobi, Kenya</span>
        </div>
      </div>
    </div>
  );

  const PrivacyPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <KenicLogo className="w-10 h-10" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">.KE Zone</h1>
                <p className="text-sm text-gray-600">Privacy Policy</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('terms')}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              View Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Introduction */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to protecting your privacy and ensuring the security of your personal information.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Last updated: January 15, 2025</span>
          </div>
        </div>

        {/* Key Points */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200">
            <Lock className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Secure Data</h3>
            <p className="text-sm text-gray-600">Your data is encrypted and stored securely</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200">
            <Eye className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Transparent</h3>
            <p className="text-sm text-gray-600">Clear information about data usage</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Your Control</h3>
            <p className="text-sm text-gray-600">You control your personal information</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          <SectionCard icon={Database} title="Information We Collect">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Name and contact information</li>
                  <li>• Email address and phone number</li>
                  <li>• Billing and payment information</li>
                  <li>• Domain registration details</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Technical Information</h4>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• IP address and device information</li>
                  <li>• Browser type and version</li>
                  <li>• Usage patterns and preferences</li>
                  <li>• Cookies and tracking data</li>
                </ul>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={Eye} title="How We Use Your Information">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Provide and maintain our domain services</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Process payments and manage billing</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Send important service notifications</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Improve our services and user experience</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Comply with legal obligations</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={Users} title="Information Sharing">
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">We DO NOT sell your data</h4>
                    <p className="text-sm text-green-700 mt-1">Your personal information is never sold to third parties.</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">We may share information with:</h4>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• KENIC (Kenya Network Information Centre) as required</li>
                  <li>• Payment processors for billing purposes</li>
                  <li>• Legal authorities when required by law</li>
                  <li>• Service providers who help us operate our platform</li>
                </ul>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={Lock} title="Data Security">
            <div className="space-y-3">
              <p>We implement industry-standard security measures to protect your information:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">SSL/TLS encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Secure data centers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Regular security audits</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Access controls</span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={User} title="Your Rights">
            <div className="space-y-3">
              <p>You have the right to:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-sm">Access your personal data</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-sm">Correct inaccurate data</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-sm">Delete your account</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-sm">Data portability</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Contact Information */}
        <ContactInfo />
      </div>
    </div>
  );

  const TermsPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <KenicLogo className="w-10 h-10" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">.KE Zone</h1>
                <p className="text-sm text-gray-600">Terms of Service</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('privacy')}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              View Privacy Policy
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Introduction */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <Scale className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using our .KE domain services.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Last updated: January 15, 2025</span>
          </div>
        </div>

        {/* Key Points */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200">
            <Gavel className="h-8 w-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Legal Agreement</h3>
            <p className="text-sm text-gray-600">Binding terms for service usage</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200">
            <Server className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Service Rules</h3>
            <p className="text-sm text-gray-600">Guidelines for proper usage</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200">
            <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Protection</h3>
            <p className="text-sm text-gray-600">Rights and responsibilities</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          <SectionCard icon={FileText} title="Acceptance of Terms">
            <div className="space-y-3">
              <p>
                By accessing and using .KE Zone services, you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Important Note</h4>
                    <p className="text-sm text-blue-700 mt-1">These terms may be updated periodically. Continued use constitutes acceptance of changes.</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={Globe} title="Domain Services">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Service Scope</h4>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• .KE domain registration and management</li>
                  <li>• DNS hosting and configuration</li>
                  <li>• Domain transfer services</li>
                  <li>• Technical support and assistance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Service Availability</h4>
                <p className="text-sm">
                  We strive to maintain 99.9% uptime for our services. Scheduled maintenance will be announced in advance. 
                  Service interruptions may occur due to factors beyond our control.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={User} title="User Responsibilities">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Account Security</h4>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Maintain confidentiality of login credentials</li>
                  <li>• Report unauthorized access immediately</li>
                  <li>• Use strong passwords and enable 2FA when available</li>
                  <li>• Keep contact information current</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Prohibited Activities</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="text-sm space-y-1">
                    <li>• Illegal activities or content</li>
                    <li>• Spam, phishing, or malware distribution</li>
                    <li>• Trademark or copyright infringement</li>
                    <li>• Fraudulent or deceptive practices</li>
                    <li>• System abuse or security violations</li>
                  </ul>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={CreditCard} title="Billing and Payment">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Payment Terms</h4>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Payments are due in advance for domain services</li>
                  <li>• All prices are in Kenya Shillings (KES) unless stated otherwise</li>
                  <li>• Failed payments may result in service suspension</li>
                  <li>• Automatic renewal applies unless cancelled</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Refund Policy</h4>
                <p className="text-sm">
                  Domain registrations are generally non-refundable due to KENIC policies. 
                  Refunds may be considered for technical failures or billing errors within 7 days.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={AlertTriangle} title="Service Limitations">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Disclaimer of Warranties</h4>
                <p className="text-sm">
                  Services are provided "as is" without warranties of any kind. We do not guarantee 
                  uninterrupted service or error-free operation.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Limitation of Liability</h4>
                <p className="text-sm">
                  Our liability is limited to the amount paid for services in the 12 months preceding 
                  any claim. We are not liable for indirect, incidental, or consequential damages.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={Scale} title="Governing Law">
            <div className="space-y-3">
              <p className="text-sm">
                These terms are governed by the laws of Kenya. Any disputes will be resolved through 
                the courts of Kenya or through binding arbitration.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">KENIC Compliance</h4>
                <p className="text-sm text-gray-700">
                  All .KE domain registrations are subject to KENIC (Kenya Network Information Centre) 
                  policies and regulations, which take precedence over conflicting terms.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Contact Information */}
        <ContactInfo />
      </div>
    </div>
  );

  return (
    <div className="font-sans">
      {currentPage === 'privacy' ? <PrivacyPage /> : <TermsPage />}
    </div>
  );
};

export default LegalPages;