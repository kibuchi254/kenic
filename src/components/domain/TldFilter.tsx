import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TldOption {
  extension: string;
  price: number;
  currency: string;
  popular?: boolean;
}

interface TldFilterProps {
  options: TldOption[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  className?: string;
}

export function TldFilter({ options, selected, onSelectionChange, className }: TldFilterProps) {
  const handleTldClick = (extension: string) => {
    const newSelected = selected.includes(extension)
      ? selected.filter(tld => tld !== extension)
      : [...selected, extension];
    onSelectionChange(newSelected);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-foreground">Filter by Extension</h3>
      
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.extension);
          
          return (
            <button
              key={option.extension}
              onClick={() => handleTldClick(option.extension)}
              className={cn(
                "flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all duration-200 hover:shadow-sm",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:border-primary/30 hover:bg-primary/5"
              )}
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{option.extension}</span>
                  {option.popular && (
                    <Badge variant="secondary" className="text-xs">
                      Popular
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatPrice(option.price, option.currency)}/year
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Selected:</span>
          <div className="flex flex-wrap gap-1">
            {selected.map((tld) => (
              <Badge
                key={tld}
                variant="default"
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => handleTldClick(tld)}
              >
                {tld} ×
              </Badge>
            ))}
          </div>
          <button
            onClick={() => onSelectionChange([])}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}