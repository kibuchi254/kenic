import React from 'react';
import { Globe, Mail, Phone, MapPin, Twitter, Linkedin, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">DomainPro</span>
            </div>
            <p className="text-muted-foreground">
              Professional domain registration with world-class support. 
              Find, register, and manage your perfect domain name.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Github className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Domain Registration</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Domain Transfer</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">DNS Management</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">WHOIS Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Email Forwarding</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Bulk Registration</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Live Chat</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Status Page</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Developer Resources</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@domainpro.app</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium text-foreground mb-2">African Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Kenya: M-Pesa enabled</div>
                <div>24/7 local support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 DomainPro. All rights reserved. ICANN Accredited Registrar.
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Cookie Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                ICANN Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}