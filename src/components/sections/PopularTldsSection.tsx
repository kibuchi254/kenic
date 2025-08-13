import React from 'react';
import { TrendingUp, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TldOption {
  extension: string;
  price: number;
  currency: string;
  description: string;
  popular?: boolean;
  trending?: boolean;
}

export function PopularTldsSection() {
  const popularTlds: TldOption[] = [
    { extension: '.com', price: 12.99, currency: 'USD', description: 'Most trusted and popular', popular: true },
    { extension: '.org', price: 14.99, currency: 'USD', description: 'Perfect for organizations', popular: true },
    { extension: '.net', price: 13.99, currency: 'USD', description: 'Great for networks & tech' },
    { extension: '.io', price: 49.99, currency: 'USD', description: 'Favorite for startups', trending: true },
    { extension: '.co', price: 32.99, currency: 'USD', description: 'Short and memorable' },
    { extension: '.app', price: 18.99, currency: 'USD', description: 'Perfect for applications', trending: true },
    { extension: '.dev', price: 17.99, currency: 'USD', description: 'Built for developers' },
    { extension: '.blog', price: 29.99, currency: 'USD', description: 'Ideal for bloggers' },
  ];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Popular Domain Extensions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose from our most popular domain extensions. Each comes with free WHOIS privacy, 
            DNS management, and email forwarding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {popularTlds.map((tld, index) => (
            <div
              key={tld.extension}
              className="group relative p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Badge */}
              {(tld.popular || tld.trending) && (
                <div className="absolute -top-3 left-4">
                  <Badge
                    variant={tld.popular ? "default" : "secondary"}
                    className="bg-primary text-primary-foreground"
                  >
                    {tld.popular && <Star className="mr-1 h-3 w-3" />}
                    {tld.trending && <TrendingUp className="mr-1 h-3 w-3" />}
                    {tld.popular ? 'Popular' : 'Trending'}
                  </Badge>
                </div>
              )}

              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {tld.extension}
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">
                  {formatPrice(tld.price, tld.currency)}
                  <span className="text-sm font-normal text-muted-foreground">/year</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {tld.description}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Register Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All 500+ Extensions
          </Button>
        </div>
      </div>
    </section>
  );
}