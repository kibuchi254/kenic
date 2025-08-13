import React from 'react';
import { Globe, User, ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  cartCount?: number;
  onMenuClick?: () => void;
}

export function Header({ cartCount = 0, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">DomainPro</h1>
              <p className="text-xs text-muted-foreground">Find. Register. Succeed.</p>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#domains" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Domains
            </a>
            <a href="#hosting" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Hosting
            </a>
            <a href="#tools" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Tools
            </a>
            <a href="#support" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Support
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* User Account */}
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>

            {/* Sign In */}
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              Sign In
            </Button>

            {/* Mobile Menu */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}