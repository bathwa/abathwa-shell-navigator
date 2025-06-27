import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import { CurrencySelector } from './currency-selector';
import { currencyService } from '../../services/currencyService';
import { ArrowRight, RefreshCw, Copy, History } from 'lucide-react';
import { Badge } from './badge';
import { Separator } from './separator';
import { useToast } from '../../hooks/use-toast';

interface CurrencyConverterProps {
  className?: string;
  showHistory?: boolean;
  compact?: boolean;
}

export function CurrencyConverter({
  className,
  showHistory = false,
  compact = false
}: CurrencyConverterProps) {
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('ZAR');
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [conversionHistory, setConversionHistory] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    calculateConversion();
    if (showHistory) {
      loadConversionHistory();
    }
  }, [amount, fromCurrency, toCurrency, showHistory]);

  const calculateConversion = () => {
    if (amount <= 0) {
      setConvertedAmount(0);
      setExchangeRate(0);
      return;
    }

    const rate = currencyService.getExchangeRate(toCurrency) / currencyService.getExchangeRate(fromCurrency);
    const converted = currencyService.convertCurrency(amount, fromCurrency, toCurrency);
    
    setExchangeRate(rate);
    setConvertedAmount(converted);
  };

  const loadConversionHistory = async () => {
    try {
      const history = await currencyService.getConversionHistory();
      setConversionHistory(history);
    } catch (error) {
      console.warn('Failed to load conversion history:', error);
    }
  };

  const handleUpdateRates = async () => {
    setIsUpdating(true);
    try {
      await currencyService.updateExchangeRates();
      calculateConversion();
      toast({
        title: "Exchange rates updated",
        description: "Latest rates have been fetched successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update exchange rates. Using cached rates.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveConversion = async () => {
    try {
      await currencyService.saveConversion({
        fromCurrency,
        toCurrency,
        amount,
        convertedAmount,
        rate: exchangeRate
      });
      
      if (showHistory) {
        loadConversionHistory();
      }
      
      toast({
        title: "Conversion saved",
        description: "Added to your conversion history.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save conversion to history.",
        variant: "destructive",
      });
    }
  };

  const handleCopyResult = () => {
    const result = `${currencyService.formatCurrency(amount, fromCurrency)} = ${currencyService.formatCurrency(convertedAmount, toCurrency)}`;
    navigator.clipboard.writeText(result);
    toast({
      title: "Copied to clipboard",
      description: result,
    });
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="text-sm"
              />
            </div>
            <CurrencySelector
              value={fromCurrency}
              onValueChange={setFromCurrency}
              variant="compact"
              showLabel={false}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={swapCurrencies}
              className="px-2"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <CurrencySelector
              value={toCurrency}
              onValueChange={setToCurrency}
              variant="compact"
              showLabel={false}
            />
          </div>
          <div className="mt-2 text-center">
            <div className="text-lg font-semibold">
              {currencyService.formatCurrency(convertedAmount, toCurrency)}
            </div>
            <div className="text-xs text-muted-foreground">
              1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Currency Converter</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpdateRates}
              disabled={isUpdating}
            >
              <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyResult}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="text-lg"
          />
        </div>

        {/* Currency Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>From</Label>
            <CurrencySelector
              value={fromCurrency}
              onValueChange={setFromCurrency}
              variant="popover"
              showLabel={false}
            />
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <CurrencySelector
              value={toCurrency}
              onValueChange={setToCurrency}
              variant="popover"
              showLabel={false}
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={swapCurrencies}
            className="rounded-full"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Conversion Result */}
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold mb-2">
            {currencyService.formatCurrency(convertedAmount, toCurrency)}
          </div>
          <div className="text-sm text-muted-foreground">
            1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={handleSaveConversion}
            className="flex-1"
            disabled={amount <= 0}
          >
            <History className="h-4 w-4 mr-2" />
            Save to History
          </Button>
        </div>

        {/* Conversion History */}
        {showHistory && conversionHistory.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <History className="h-4 w-4" />
                <Label>Recent Conversions</Label>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {conversionHistory.slice(0, 5).map((conversion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded"
                  >
                    <div>
                      <div className="font-medium">
                        {currencyService.formatCurrency(conversion.amount, conversion.fromCurrency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {conversion.fromCurrency} → {conversion.toCurrency}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {currencyService.formatCurrency(conversion.convertedAmount, conversion.toCurrency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(conversion.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 