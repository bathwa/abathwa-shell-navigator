import React, { useState, useEffect } from 'react';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { Badge } from './badge';
import { Separator } from './separator';
import { currencyService, type Currency } from '../../services/currencyService';
import { ChevronDown, RefreshCw, Settings } from 'lucide-react';

interface CurrencySelectorProps {
  value?: string;
  onValueChange?: (currency: string) => void;
  showLabel?: boolean;
  variant?: 'select' | 'popover' | 'compact';
  className?: string;
}

export function CurrencySelector({
  value,
  onValueChange,
  showLabel = true,
  variant = 'select',
  className
}: CurrencySelectorProps) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadCurrencies = () => {
      const availableCurrencies = currencyService.getCurrencies();
      setCurrencies(availableCurrencies);
      
      const currentCurrency = value || currencyService.getUserPreferredCurrency();
      setSelectedCurrency(currentCurrency);
    };

    loadCurrencies();
  }, [value]);

  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    currencyService.setUserPreferredCurrency(currencyCode);
    onValueChange?.(currencyCode);
  };

  const handleUpdateRates = async () => {
    setIsUpdating(true);
    try {
      await currencyService.updateExchangeRates();
      // Refresh currencies to show updated rates
      setCurrencies(currencyService.getCurrencies());
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentCurrency = () => {
    return currencies.find(c => c.code === selectedCurrency);
  };

  const currentCurrency = getCurrentCurrency();

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={handleUpdateRates}
          disabled={isUpdating}
        >
          <RefreshCw className={`h-3 w-3 ${isUpdating ? 'animate-spin' : ''}`} />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2">
              <span className="mr-1">{currentCurrency?.flag}</span>
              <span className="text-xs">{currentCurrency?.code}</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0" align="end">
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Select Currency
              </div>
              {currencies.map((currency) => (
                <Button
                  key={currency.code}
                  variant={currency.code === selectedCurrency ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start mb-1"
                  onClick={() => handleCurrencyChange(currency.code)}
                >
                  <span className="mr-2">{currency.flag}</span>
                  <span className="text-xs">{currency.code}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {currency.symbol}
                  </span>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  if (variant === 'popover') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showLabel && (
          <span className="text-sm text-muted-foreground">Currency:</span>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-32 justify-between">
              <div className="flex items-center space-x-2">
                <span>{currentCurrency?.flag}</span>
                <span className="font-medium">{currentCurrency?.code}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="end">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Select Currency</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUpdateRates}
                  disabled={isUpdating}
                >
                  <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="space-y-2">
                {currencies.map((currency) => (
                  <Button
                    key={currency.code}
                    variant={currency.code === selectedCurrency ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleCurrencyChange(currency.code)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <span className="text-lg">{currency.flag}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{currency.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {currency.code} • {currency.symbol}
                        </div>
                      </div>
                      {currency.code === selectedCurrency && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="text-xs text-muted-foreground">
                Rates updated: {currentCurrency?.lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Default select variant
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && (
        <span className="text-sm text-muted-foreground">Currency:</span>
      )}
      <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-32">
          <SelectValue>
            <div className="flex items-center space-x-2">
              <span>{currentCurrency?.flag}</span>
              <span>{currentCurrency?.code}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className="flex items-center space-x-2">
                <span>{currency.flag}</span>
                <span>{currency.name}</span>
                <span className="text-muted-foreground">({currency.code})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUpdateRates}
        disabled={isUpdating}
        title="Update exchange rates"
      >
        <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
} 