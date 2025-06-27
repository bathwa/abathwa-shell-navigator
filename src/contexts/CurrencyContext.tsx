import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { currencyService, type Currency } from '../services/currencyService';

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  currencies: Currency[];
  formatCurrency: (amount: number, currencyCode?: string) => string;
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => number;
  updateExchangeRates: () => Promise<void>;
  isUpdatingRates: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<string>('USD');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isUpdatingRates, setIsUpdatingRates] = useState(false);

  useEffect(() => {
    // Initialize currency service
    const initializeCurrency = () => {
      const availableCurrencies = currencyService.getCurrencies();
      setCurrencies(availableCurrencies);
      
      const userPreferred = currencyService.getUserPreferredCurrency();
      setSelectedCurrencyState(userPreferred);
    };

    initializeCurrency();
  }, []);

  const setSelectedCurrency = (currencyCode: string) => {
    if (currencyService.isValidCurrency(currencyCode)) {
      setSelectedCurrencyState(currencyCode);
      currencyService.setUserPreferredCurrency(currencyCode);
    }
  };

  const formatCurrency = (amount: number, currencyCode?: string) => {
    return currencyService.formatCurrency(amount, currencyCode || selectedCurrency);
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
    return currencyService.convertCurrency(amount, fromCurrency, toCurrency);
  };

  const updateExchangeRates = async () => {
    setIsUpdatingRates(true);
    try {
      await currencyService.updateExchangeRates();
      // Refresh currencies to show updated rates
      setCurrencies(currencyService.getCurrencies());
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    } finally {
      setIsUpdatingRates(false);
    }
  };

  const value: CurrencyContextType = {
    selectedCurrency,
    setSelectedCurrency,
    currencies,
    formatCurrency,
    convertCurrency,
    updateExchangeRates,
    isUpdatingRates,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
} 