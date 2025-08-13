import React from 'react';
import { CheckCircle, XCircle, Crown, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface DomainResult {
  domain: string;
  status: 'available' | 'taken' | 'premium' | 'transfer';
  price?: number;
  currency?: string;
  premium?: boolean;
}

interface DomainResultProps {
  result: DomainResult;
  onAddToCart: (domain: string) => void;
  className?: string;
}

export function DomainResult({ result, onAddToCart, className }: DomainResultProps) {
  const { domain, status, price, currency = 'USD', premium } = result;

  const getStatusIcon = () => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'taken':
        return <XCircle className="h-5 w-5 text-muted-foreground" />;
      case 'premium':
        return <Crown className="h-5 w-5 text-yellow-600" />;
      case 'transfer':
        return <ArrowRight className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'available':
        return <Badge variant="available">Available</Badge>;
      case 'taken':
        return <Badge variant="taken">Taken</Badge>;
      case 'premium':
        return <Badge variant="premium">Premium</Badge>;
      case 'transfer':
        return <Badge variant="transfer">Transfer</Badge>;
      default:
        return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const isActionable = status === 'available' || status === 'premium' || status === 'transfer';

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border bg-card transition-all duration-200 hover:shadow-md",
        status === 'available' && "border-success/20 bg-success/5",
        status === 'taken' && "border-border bg-muted/50",
        status === 'premium' && "border-yellow-200 bg-yellow-50/80",
        status === 'transfer' && "border-blue-200 bg-blue-50/80",
        className
      )}
    >
      <div className="flex items-center space-x-4">
        {getStatusIcon()}
        <div>
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-lg text-foreground">{domain}</span>
            {getStatusBadge()}
          </div>
          {price && (
            <div className="mt-1 flex items-center space-x-2">
              <span className="text-2xl font-bold text-foreground">
                {formatPrice(price)}
              </span>
              <span className="text-sm text-muted-foreground">
                /{currency.toLowerCase()}/year
              </span>
              {premium && (
                <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                  Premium Domain
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {isActionable && (
        <Button
          onClick={() => onAddToCart(domain)}
          variant={status === 'premium' ? 'premium' : status === 'available' ? 'success' : 'default'}
          size="lg"
          className="font-semibold"
        >
          {status === 'transfer' ? 'Transfer' : 'Add to Cart'}
        </Button>
      )}
    </div>
  );
}