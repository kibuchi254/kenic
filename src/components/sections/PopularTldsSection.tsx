import React from 'react';
import { TrendingUp, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TldOption {
  extension: string;
  description: string;
  popular?: boolean;
  trending?: boolean;
  requiresDocs?: boolean;
}

export function PopularTldsSection() {
  const popularTlds: TldOption[] = [
    { extension: '.ke', description: 'Second-level domain for Kenya', popular: true },
    { extension: '.co.ke', description: 'For e-commerce sites and commercial ventures', popular: true },
    { extension: '.or.ke', description: 'For NGOs and not-for-profit organizations' },
    { extension: '.ne.ke', description: 'For network-related organizations' },
    { extension: '.go.ke', description: 'For government institutions', requiresDocs: true },
    { extension: '.me.ke', description: 'For personal websites and blogs', trending: true },
    { extension: '.mobi.ke', description: 'For mobile-friendly websites and apps', trending: true },
    { extension: '.info.ke', description: 'For informative or educational websites' },
    { extension: '.sc.ke', description: 'For lower and middle institutes of learning', requiresDocs: true },
    { extension: '.ac.ke', description: 'For higher education institutions', requiresDocs: true },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Popular .KE Domain Extensions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose from our Kenya-specific domain extensions. Each comes with free WHOIS privacy,
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
              {(tld.popular || tld.trending || tld.requiresDocs) && (
                <div className="absolute -top-3 left-4">
                  <Badge
                    variant={tld.popular ? "default" : tld.trending ? "secondary" : "outline"}
                    className={tld.requiresDocs ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}
                  >
                    {tld.popular && <Star className="mr-1 h-3 w-3" />}
                    {tld.trending && <TrendingUp className="mr-1 h-3 w-3" />}
                    {tld.popular ? 'Popular' : tld.trending ? 'Trending' : 'Requires Docs'}
                  </Badge>
                </div>
              )}
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {tld.extension}
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
            View All .KE Extensions
          </Button>
        </div>
      </div>
    </section>
  );
}
