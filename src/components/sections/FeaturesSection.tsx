import React from 'react';
import { 
  Shield, 
  Zap, 
  Globe, 
  Lock, 
  Mail, 
  Database, 
  Headphones, 
  CreditCard,
  Smartphone 
} from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}

export function FeaturesSection() {
  const features: Feature[] = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast Search",
      description: "Get instant domain availability results with intelligent suggestions and typo correction.",
      highlight: true,
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Free WHOIS Privacy",
      description: "Protect your personal information with complimentary WHOIS privacy protection.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "500+ TLD Extensions",
      description: "Choose from the world's largest selection of domain extensions for every industry.",
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Secure DNS Management",
      description: "Advanced DNS controls with one-click templates for popular services.",
      highlight: true,
    },
    {
      icon: <Mail className="h-8 w-8" />,
      title: "Email Forwarding",
      description: "Professional email forwarding to make your domain work from day one.",
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "Bulk Operations",
      description: "Search, register, and manage hundreds of domains with our bulk tools.",
    },
    {
      icon: <Headphones className="h-8 w-8" />,
      title: "24/7 Expert Support",
      description: "Get help from domain experts anytime via chat, email, or phone.",
      highlight: true,
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Flexible Payments",
      description: "Pay with cards, digital wallets, or M-Pesa. Multi-currency support.",
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile Optimized",
      description: "Manage your domains on-the-go with our responsive mobile interface.",
    },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Everything You Need to Succeed Online
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From search to setup, we provide all the tools and services you need 
            to establish your professional online presence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group p-8 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                feature.highlight
                  ? 'bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20'
                  : 'bg-card border-border'
              }`}
            >
              <div className={`inline-flex p-3 rounded-xl mb-6 ${
                feature.highlight
                  ? 'bg-gradient-primary text-white'
                  : 'bg-muted text-foreground'
              }`}>
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}