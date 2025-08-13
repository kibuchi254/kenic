import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DomainSearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function DomainSearchBar({ onSearch, isLoading = false, className }: DomainSearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Find your perfect domain (try keywords, brands, or phrases)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 pr-4 h-14 text-lg bg-white/80 backdrop-blur-sm border-2 hover:bg-white focus:bg-white transition-all duration-300"
            disabled={isLoading}
            aria-label="Domain search"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          variant="hero"
          disabled={!query.trim() || isLoading}
          className="ml-3 h-14 px-8 font-bold text-lg"
          aria-label="Search domains"
        >
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Search
            </>
          )}
        </Button>
      </div>
      
      {/* Search suggestions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {['startup', 'tech', 'blog', 'shop', 'app'].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setQuery(suggestion)}
            className="px-3 py-1.5 text-sm bg-white/60 hover:bg-white/80 rounded-full border border-white/50 hover:border-primary/30 transition-all duration-200 text-muted-foreground hover:text-foreground"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </form>
  );
}