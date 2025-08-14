import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, User, ShoppingCart, Menu, X, ChevronDown, 
  Server, Shield, FileText, Users, Award, Settings,
  Download, Link, CreditCard, UserCheck, Calendar,
  Search, Newspaper, Briefcase, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  cartCount?: number;
}

const megaMenuData = {
  domains: {
    type: 'grid',
    columns: [
      {
        title: '.KE Products',
        items: [
          { label: '.KE Products', icon: Globe, description: 'Register your .ke domain' },
          { label: 'How to Register', icon: FileText, description: 'Step-by-step guide' },
          { label: 'Domain Statistics', icon: Server, description: 'View registration stats' },
          { label: 'Value Proposition', icon: Award, description: 'Why choose .KE' }
        ]
      },
      {
        title: 'Other Services',
        items: [
          { label: 'Deleted Domains', icon: Search, description: 'Find expired domains' },
          { label: 'Domain Checker', icon: Shield, description: 'Check availability', badge: 'NEW' }
        ]
      }
    ]
  },
  discover: {
    type: 'grid',
    columns: [
      {
        title: 'About Us',
        items: [
          { label: 'KENIC Background', icon: FileText, description: 'Our story & mission' },
          { label: 'Board Members', icon: Users, description: 'Meet our leadership' },
          { label: 'KENIC Staff', icon: UserCheck, description: 'Our team' },
          { label: 'KENIC Partnerships', icon: Link, description: 'Strategic alliances' },
          { label: 'Hall of Fame', icon: Award, description: 'Recognition & awards' }
        ]
      },
      {
        title: 'Legal & Policy',
        items: [
          { label: 'KENIC Policies', icon: Shield, description: 'Terms & conditions' },
          { label: 'Domain Disputes', icon: FileText, description: 'Resolution process' }
        ]
      },
      {
        title: 'Information',
        items: [
          { label: 'KENIC Service Charter', icon: FileText, description: 'Our commitments' },
          { label: 'KENIC Tenders', icon: Briefcase, description: 'Current opportunities' },
          { label: 'Certificates', icon: Award, description: 'Official documents' }
        ]
      }
    ]
  },
  resources: {
    type: 'split',
    leftColumn: [
      { label: 'DNS & DNSSEC Material', icon: Server, description: 'Technical documentation' },
      { label: 'Downloads', icon: Download, description: 'Forms & resources' },
      { label: 'Useful Links', icon: Link, description: 'External resources' },
      { label: 'Payment Details', icon: CreditCard, description: 'Payment methods' }
    ],
    rightColumn: {
      title: 'Featured Resource',
      description: 'Get started with DNS management and security best practices',
      image: '/api/placeholder/300/150',
      link: '#'
    }
  },
  registrars: {
    type: 'grid',
    columns: [
      {
        title: 'Access & Login',
        items: [
          { label: 'Registrar Login', icon: UserCheck, description: 'Access your account' },
          { label: 'Summit 2024', icon: Calendar, description: 'Annual conference', badge: 'EVENT' }
        ]
      },
      {
        title: 'Registration',
        items: [
          { label: 'Licensed Registrars', icon: Users, description: 'View all partners' },
          { label: 'Become a Registrar', icon: UserCheck, description: 'Join our network' },
          { label: 'Annual Registrar Awards', icon: Award, description: 'Recognition program' }
        ]
      }
    ]
  },
  news: {
    type: 'split',
    leftColumn: [
      { label: 'Blog & Articles', icon: Newspaper, description: 'Latest insights' },
      { label: 'Events', icon: Calendar, description: 'Upcoming events' },
      { label: 'Trainings', icon: Users, description: 'Educational sessions' },
      { label: 'Newsletter', icon: FileText, description: 'Stay updated' },
      { label: 'News & Updates', icon: Newspaper, description: 'Latest announcements' }
    ],
    rightColumn: {
      title: 'Latest News',
      description: 'Stay informed about the latest developments in the .KE domain space',
      image: '/api/placeholder/300/150',
      link: '#'
    }
  }
};

export function Header({ cartCount = 0 }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveDropdown, setMobileActiveDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const navRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleMobileDropdown = (menu: string) => {
    setMobileActiveDropdown(mobileActiveDropdown === menu ? null : menu);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setMobileActiveDropdown(null);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // All dropdowns will be centered on the page
  const getDropdownPosition = () => {
    return 'left-1/2 transform -translate-x-1/2';
  };

  const renderGridDropdown = (data: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6">
      {data.columns.map((column: any, colIndex: number) => (
        <div key={colIndex} className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">
            {column.title}
          </h3>
          <div className="space-y-3">
            {column.items.map((item: any, itemIndex: number) => (
              <a
                key={itemIndex}
                href="#"
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-red-600 transition-colors duration-200 group"
              >
                <item.icon className="h-5 w-5 text-red-600 mt-0.5 group-hover:text-white flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-white">
                      {item.label}
                    </span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 group-hover:bg-white group-hover:text-red-600">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 group-hover:text-red-100 mt-1">{item.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSplitDropdown = (data: any) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      <div className="space-y-3">
        {data.leftColumn.map((item: any, index: number) => (
          <a
            key={index}
            href="#"
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-red-600 transition-colors duration-200 group"
          >
            <item.icon className="h-5 w-5 text-red-600 mt-0.5 group-hover:text-white flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 group-hover:text-white">
                {item.label}
              </span>
              <p className="text-xs text-gray-600 group-hover:text-red-100 mt-1">{item.description}</p>
            </div>
          </a>
        ))}
      </div>
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
          <Server className="h-12 w-12 text-gray-400" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">{data.rightColumn.title}</h4>
          <p className="text-sm text-gray-600 mb-4">{data.rightColumn.description}</p>
          <Button variant="outline" size="sm" className="w-full hover:bg-red-600 hover:text-white hover:border-red-600">
            Learn More <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  const navItems = [
    { label: 'Domains', key: 'domains' },
    { label: 'Discover KENIC', key: 'discover' },
    { label: 'Resources', key: 'resources' },
    { label: 'Registrars', key: 'registrars' },
    { label: 'Whois', key: 'whois', direct: true },
    { label: 'News & Events', key: 'news' },
    { label: 'Careers', key: 'careers', direct: true }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <a href="/" aria-label="Home">
              <img
                src="/images/logo.svg"
                alt="KENIC Logo"
                className="h-20 w-20 sm:h-20 sm:w-20 transition-transform duration-300 hover:scale-105"
              />
            </a>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">.KE Zone</h1>
              <p className="text-xs text-gray-600">Get Your .KE Today!</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8" ref={navRef}>
            {navItems.map((item) => (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => !item.direct && handleMouseEnter(item.key)}
                onMouseLeave={handleMouseLeave}
              >
                <a
                  href={item.direct ? `#${item.key}` : '#'}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-900 hover:text-red-600 transition-colors duration-200"
                >
                  <span>{item.label}</span>
                  {!item.direct && (
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  )}
                </a>

                {/* Mega Menu Dropdown */}
                {!item.direct && activeDropdown === item.key && megaMenuData[item.key as keyof typeof megaMenuData] && (
                  <div className="fixed left-1/2 transform -translate-x-1/2 top-16 w-screen max-w-4xl bg-white border rounded-lg shadow-lg z-50">
                    {megaMenuData[item.key as keyof typeof megaMenuData].type === 'grid'
                      ? renderGridDropdown(megaMenuData[item.key as keyof typeof megaMenuData])
                      : renderSplitDropdown(megaMenuData[item.key as keyof typeof megaMenuData])
                    }
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-600"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* User Account */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
              aria-label="User account"
            >
              <User className="h-5 w-5" />
            </Button>

            {/* Sign In */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex text-sm font-medium px-4 hover:bg-red-600 hover:text-white hover:border-red-600"
            >
              Sign In
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-screen opacity-100 visible' 
            : 'max-h-0 opacity-0 invisible overflow-hidden'
        }`}>
          <nav className="py-4 space-y-2 bg-white/95 backdrop-blur-md border-t max-h-[calc(100vh-4rem)] overflow-y-auto">
            {navItems.map((item) => (
              <div key={item.key} className="space-y-2">
                {item.direct ? (
                  <a
                    href={`#${item.key}`}
                    className="flex items-center justify-between w-full p-3 text-sm font-medium text-gray-900 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <button
                    onClick={() => toggleMobileDropdown(item.key)}
                    className="flex items-center justify-between w-full p-3 text-sm font-medium text-gray-900 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200 group"
                  >
                    <span>{item.label}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                      mobileActiveDropdown === item.key ? 'rotate-180' : ''
                    }`} />
                  </button>
                )}

                {/* Mobile Dropdown Content */}
                {!item.direct && mobileActiveDropdown === item.key && megaMenuData[item.key as keyof typeof megaMenuData] && (
                  <div className="pl-4 space-y-2 border-l-2 border-red-200 ml-3 max-h-80 overflow-y-auto">
                    {megaMenuData[item.key as keyof typeof megaMenuData].type === 'grid' 
                      ? megaMenuData[item.key as keyof typeof megaMenuData].columns.map((column: any, colIndex: number) => (
                          <div key={colIndex} className="space-y-2">
                            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 py-2">
                              {column.title}
                            </h4>
                            {column.items.map((subItem: any, subIndex: number) => (
                              <a
                                key={subIndex}
                                href="#"
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-200 group"
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setMobileActiveDropdown(null);
                                }}
                              >
                                <subItem.icon className="h-4 w-4 text-red-600 group-hover:text-white flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-900 group-hover:text-white font-medium">{subItem.label}</span>
                                    {subItem.badge && (
                                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 group-hover:bg-white group-hover:text-red-600">
                                        {subItem.badge}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 group-hover:text-red-100 mt-1">{subItem.description}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        ))
                      : megaMenuData[item.key as keyof typeof megaMenuData].leftColumn?.map((subItem: any, subIndex: number) => (
                          <a
                            key={subIndex}
                            href="#"
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-200 group"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setMobileActiveDropdown(null);
                            }}
                          >
                            <subItem.icon className="h-4 w-4 text-red-600 group-hover:text-white flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-sm text-gray-900 group-hover:text-white font-medium">{subItem.label}</span>
                              <p className="text-xs text-gray-600 group-hover:text-red-100 mt-1">{subItem.description}</p>
                            </div>
                          </a>
                        ))
                    }
                  </div>
                )}
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-sm font-medium hover:bg-red-600 hover:text-white hover:border-red-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}