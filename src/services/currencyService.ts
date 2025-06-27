import { db } from '../data/db';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  exchangeRate: number; // Rate relative to USD
  lastUpdated: Date;
}

export interface CurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: Date;
}

export interface ExchangeRateData {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

class CurrencyService {
  private currencies: Currency[] = [
    {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      flag: '🇺🇸',
      exchangeRate: 1,
      lastUpdated: new Date()
    },
    {
      code: 'ZAR',
      name: 'South African Rand',
      symbol: 'R',
      flag: '🇿🇦',
      exchangeRate: 18.5, // Approximate rate
      lastUpdated: new Date()
    },
    {
      code: 'ZWL',
      name: 'Zimbabwean Dollar',
      symbol: 'Z$',
      flag: '🇿🇼',
      exchangeRate: 322.5, // Approximate rate
      lastUpdated: new Date()
    },
    {
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      flag: '🇬🇧',
      exchangeRate: 0.79, // Approximate rate
      lastUpdated: new Date()
    },
    {
      code: 'BWP',
      name: 'Botswana Pula',
      symbol: 'P',
      flag: '🇧🇼',
      exchangeRate: 13.2, // Approximate rate
      lastUpdated: new Date()
    }
  ];

  private userPreferredCurrency: string = 'USD';
  private exchangeRateCache: Map<string, number> = new Map();
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.loadUserPreferences();
    this.initializeExchangeRates();
  }

  // Get all available currencies
  getCurrencies(): Currency[] {
    return this.currencies;
  }

  // Get currency by code
  getCurrency(code: string): Currency | undefined {
    return this.currencies.find(c => c.code === code);
  }

  // Get user's preferred currency
  getUserPreferredCurrency(): string {
    return this.userPreferredCurrency;
  }

  // Set user's preferred currency
  setUserPreferredCurrency(currencyCode: string): void {
    if (this.currencies.find(c => c.code === currencyCode)) {
      this.userPreferredCurrency = currencyCode;
      this.saveUserPreferences();
    }
  }

  // Convert amount between currencies
  convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number {
    if (fromCurrency === toCurrency) return amount;

    const fromRate = this.getExchangeRate(fromCurrency);
    const toRate = this.getExchangeRate(toCurrency);

    if (fromRate && toRate) {
      // Convert to USD first, then to target currency
      const usdAmount = amount / fromRate;
      return usdAmount * toRate;
    }

    return amount; // Fallback to original amount
  }

  // Format currency amount
  formatCurrency(
    amount: number,
    currencyCode: string = this.userPreferredCurrency,
    options?: Intl.NumberFormatOptions
  ): string {
    const currency = this.getCurrency(currencyCode);
    if (!currency) return amount.toString();

    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options
    };

    try {
      return new Intl.NumberFormat('en-US', defaultOptions).format(amount);
    } catch (error) {
      // Fallback formatting
      return `${currency.symbol}${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
  }

  // Get exchange rate for a currency (relative to USD)
  getExchangeRate(currencyCode: string): number {
    if (currencyCode === 'USD') return 1;
    
    const currency = this.getCurrency(currencyCode);
    return currency?.exchangeRate || 1;
  }

  // Update exchange rates from API
  async updateExchangeRates(): Promise<void> {
    try {
      // Try to fetch from a free exchange rate API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (response.ok) {
        const data: ExchangeRateData = await response.json();
        
        // Update rates for our supported currencies
        this.currencies.forEach(currency => {
          if (currency.code !== 'USD' && data.rates[currency.code]) {
            currency.exchangeRate = data.rates[currency.code];
            currency.lastUpdated = new Date();
          }
        });

        this.lastFetchTime = Date.now();
        this.saveExchangeRates();
      }
    } catch (error) {
      console.warn('Failed to fetch exchange rates:', error);
      // Use cached rates or fallback rates
      this.loadCachedExchangeRates();
    }
  }

  // Check if exchange rates need updating
  shouldUpdateRates(): boolean {
    return Date.now() - this.lastFetchTime > this.CACHE_DURATION;
  }

  // Get conversion history
  async getConversionHistory(): Promise<CurrencyConversion[]> {
    try {
      const conversions = await db.table('currency_conversions')
        .orderBy('timestamp')
        .reverse()
        .limit(50)
        .toArray();
      
      return conversions.map(conv => ({
        ...conv,
        timestamp: new Date(conv.timestamp)
      }));
    } catch (error) {
      console.warn('Failed to load conversion history:', error);
      return [];
    }
  }

  // Save conversion to history
  async saveConversion(conversion: Omit<CurrencyConversion, 'timestamp'>): Promise<void> {
    try {
      await db.table('currency_conversions').add({
        ...conversion,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to save conversion:', error);
    }
  }

  // Initialize exchange rates
  private async initializeExchangeRates(): Promise<void> {
    this.loadCachedExchangeRates();
    
    if (this.shouldUpdateRates()) {
      await this.updateExchangeRates();
    }
  }

  // Load cached exchange rates
  private loadCachedExchangeRates(): void {
    try {
      const cached = localStorage.getItem('abathwa_exchange_rates');
      if (cached) {
        const data = JSON.parse(cached);
        this.lastFetchTime = data.timestamp || 0;
        
        this.currencies.forEach(currency => {
          if (data.rates && data.rates[currency.code]) {
            currency.exchangeRate = data.rates[currency.code];
            currency.lastUpdated = new Date(data.lastUpdated || Date.now());
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load cached exchange rates:', error);
    }
  }

  // Save exchange rates to cache
  private saveExchangeRates(): void {
    try {
      const rates: Record<string, number> = {};
      this.currencies.forEach(currency => {
        rates[currency.code] = currency.exchangeRate;
      });

      localStorage.setItem('abathwa_exchange_rates', JSON.stringify({
        rates,
        timestamp: this.lastFetchTime,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Failed to save exchange rates:', error);
    }
  }

  // Load user preferences
  private loadUserPreferences(): void {
    try {
      const preferred = localStorage.getItem('abathwa_preferred_currency');
      if (preferred && this.currencies.find(c => c.code === preferred)) {
        this.userPreferredCurrency = preferred;
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
  }

  // Save user preferences
  private saveUserPreferences(): void {
    try {
      localStorage.setItem('abathwa_preferred_currency', this.userPreferredCurrency);
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }

  // Get currency display info
  getCurrencyDisplay(currencyCode: string): { symbol: string; flag: string; name: string } {
    const currency = this.getCurrency(currencyCode);
    return {
      symbol: currency?.symbol || currencyCode,
      flag: currency?.flag || '🏳️',
      name: currency?.name || currencyCode
    };
  }

  // Validate currency code
  isValidCurrency(currencyCode: string): boolean {
    return this.currencies.some(c => c.code === currencyCode);
  }

  // Get currency options for select components
  getCurrencyOptions(): { value: string; label: string; flag: string }[] {
    return this.currencies.map(currency => ({
      value: currency.code,
      label: `${currency.name} (${currency.code})`,
      flag: currency.flag
    }));
  }
}

// Create singleton instance
export const currencyService = new CurrencyService(); 