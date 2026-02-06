import { supabase } from '@/integrations/supabase/client';

// Currency symbols
export const CURRENCY_SYMBOLS: Record<string, string> = {
  'HUF': 'Ft',
  'EUR': '€',
  'USD': '$',
  'GBP': '£',
  'CHF': 'Fr',
  'PLN': 'zł',
  'CZK': 'Kč',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'RON': 'lei',
  'BGN': 'лв',
  'HRK': 'kn',
  'RSD': 'дин',
  'UAH': '₴',
  'RUB': '₽',
  'JPY': '¥',
  'CNY': '¥',
  'INR': '₹',
  'BRL': 'R$',
  'AUD': 'A$',
  'CAD': 'C$',
};

// Currency names
export const CURRENCY_NAMES: Record<string, string> = {
  'HUF': 'Magyar forint',
  'EUR': 'Euro',
  'USD': 'US Dollar',
  'GBP': 'British Pound',
  'CHF': 'Swiss Franc',
  'PLN': 'Polish Zloty',
  'CZK': 'Czech Koruna',
  'SEK': 'Swedish Krona',
  'RON': 'Romanian Leu',
};

// Common currencies for selector
export const COMMON_CURRENCIES = ['EUR', 'USD', 'GBP', 'HUF', 'CHF', 'PLN', 'CZK'];

// Format currency amount
export function formatCurrency(
  amount: number,
  currencyCode: string = 'HUF',
  locale: string = 'hu-HU'
): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
  
  // Format number based on currency
  if (currencyCode === 'HUF') {
    return `${amount.toLocaleString(locale)} ${symbol}`;
  }
  
  return `${symbol}${amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Convert between currencies
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return amount;
  
  try {
    // Try direct rate
    const { data: directRate } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .single();
    
    if (directRate) {
      return amount * Number(directRate.rate);
    }
    
    // Try via EUR as intermediate
    const { data: toEur } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', 'EUR')
      .single();
    
    const { data: fromEur } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('from_currency', 'EUR')
      .eq('to_currency', toCurrency)
      .single();
    
    if (toEur && fromEur) {
      const eurAmount = amount * Number(toEur.rate);
      return eurAmount * Number(fromEur.rate);
    }
    
    // Fallback: return original amount
    // No exchange rate found
    return amount;
  } catch (error) {
    console.error('Currency conversion error:', error);
    return amount;
  }
}

// Get exchange rate
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number | null> {
  if (fromCurrency === toCurrency) return 1;
  
  try {
    const { data } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .single();
    
    return data ? Number(data.rate) : null;
  } catch {
    return null;
  }
}

// Fetch all exchange rates
export async function fetchExchangeRates(): Promise<Record<string, Record<string, number>>> {
  const { data } = await supabase
    .from('exchange_rates')
    .select('from_currency, to_currency, rate');
  
  const rates: Record<string, Record<string, number>> = {};
  
  (data || []).forEach(row => {
    if (!rates[row.from_currency]) {
      rates[row.from_currency] = {};
    }
    rates[row.from_currency][row.to_currency] = Number(row.rate);
  });
  
  return rates;
}
