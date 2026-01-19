// Country data for global project management

export interface Country {
  code: string;
  name: string;
  nameHu: string;
  defaultCurrency: string;
  defaultTimezone: string;
  lat: number;
  lng: number;
}

export const COUNTRIES: Country[] = [
  { code: 'HU', name: 'Hungary', nameHu: 'Magyarország', defaultCurrency: 'HUF', defaultTimezone: 'Europe/Budapest', lat: 47.16, lng: 19.50 },
  { code: 'DE', name: 'Germany', nameHu: 'Németország', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Berlin', lat: 51.16, lng: 10.45 },
  { code: 'AT', name: 'Austria', nameHu: 'Ausztria', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Vienna', lat: 47.52, lng: 14.55 },
  { code: 'CH', name: 'Switzerland', nameHu: 'Svájc', defaultCurrency: 'CHF', defaultTimezone: 'Europe/Zurich', lat: 46.82, lng: 8.23 },
  { code: 'GB', name: 'United Kingdom', nameHu: 'Egyesült Királyság', defaultCurrency: 'GBP', defaultTimezone: 'Europe/London', lat: 55.38, lng: -3.44 },
  { code: 'US', name: 'United States', nameHu: 'Egyesült Államok', defaultCurrency: 'USD', defaultTimezone: 'America/New_York', lat: 37.09, lng: -95.71 },
  { code: 'FR', name: 'France', nameHu: 'Franciaország', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Paris', lat: 46.23, lng: 2.21 },
  { code: 'ES', name: 'Spain', nameHu: 'Spanyolország', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Madrid', lat: 40.46, lng: -3.75 },
  { code: 'IT', name: 'Italy', nameHu: 'Olaszország', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Rome', lat: 41.87, lng: 12.57 },
  { code: 'NL', name: 'Netherlands', nameHu: 'Hollandia', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Amsterdam', lat: 52.13, lng: 5.29 },
  { code: 'BE', name: 'Belgium', nameHu: 'Belgium', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Brussels', lat: 50.50, lng: 4.47 },
  { code: 'PL', name: 'Poland', nameHu: 'Lengyelország', defaultCurrency: 'PLN', defaultTimezone: 'Europe/Warsaw', lat: 51.92, lng: 19.15 },
  { code: 'CZ', name: 'Czech Republic', nameHu: 'Csehország', defaultCurrency: 'CZK', defaultTimezone: 'Europe/Prague', lat: 49.82, lng: 15.47 },
  { code: 'SK', name: 'Slovakia', nameHu: 'Szlovákia', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Bratislava', lat: 48.67, lng: 19.70 },
  { code: 'RO', name: 'Romania', nameHu: 'Románia', defaultCurrency: 'RON', defaultTimezone: 'Europe/Bucharest', lat: 45.94, lng: 24.97 },
  { code: 'UA', name: 'Ukraine', nameHu: 'Ukrajna', defaultCurrency: 'UAH', defaultTimezone: 'Europe/Kiev', lat: 48.38, lng: 31.17 },
  { code: 'SE', name: 'Sweden', nameHu: 'Svédország', defaultCurrency: 'SEK', defaultTimezone: 'Europe/Stockholm', lat: 60.13, lng: 18.64 },
  { code: 'NO', name: 'Norway', nameHu: 'Norvégia', defaultCurrency: 'NOK', defaultTimezone: 'Europe/Oslo', lat: 60.47, lng: 8.47 },
  { code: 'FI', name: 'Finland', nameHu: 'Finnország', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Helsinki', lat: 61.92, lng: 25.75 },
  { code: 'DK', name: 'Denmark', nameHu: 'Dánia', defaultCurrency: 'DKK', defaultTimezone: 'Europe/Copenhagen', lat: 56.26, lng: 9.50 },
  { code: 'PT', name: 'Portugal', nameHu: 'Portugália', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Lisbon', lat: 39.40, lng: -8.22 },
  { code: 'GR', name: 'Greece', nameHu: 'Görögország', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Athens', lat: 39.07, lng: 21.82 },
  { code: 'AU', name: 'Australia', nameHu: 'Ausztrália', defaultCurrency: 'AUD', defaultTimezone: 'Australia/Sydney', lat: -25.27, lng: 133.78 },
  { code: 'CA', name: 'Canada', nameHu: 'Kanada', defaultCurrency: 'CAD', defaultTimezone: 'America/Toronto', lat: 56.13, lng: -106.35 },
  { code: 'JP', name: 'Japan', nameHu: 'Japán', defaultCurrency: 'JPY', defaultTimezone: 'Asia/Tokyo', lat: 36.20, lng: 138.25 },
  { code: 'BR', name: 'Brazil', nameHu: 'Brazília', defaultCurrency: 'BRL', defaultTimezone: 'America/Sao_Paulo', lat: -14.24, lng: -51.93 },
  { code: 'IN', name: 'India', nameHu: 'India', defaultCurrency: 'INR', defaultTimezone: 'Asia/Kolkata', lat: 20.59, lng: 78.96 },
  { code: 'CN', name: 'China', nameHu: 'Kína', defaultCurrency: 'CNY', defaultTimezone: 'Asia/Shanghai', lat: 35.86, lng: 104.20 },
  { code: 'KR', name: 'South Korea', nameHu: 'Dél-Korea', defaultCurrency: 'KRW', defaultTimezone: 'Asia/Seoul', lat: 35.91, lng: 127.77 },
  { code: 'SG', name: 'Singapore', nameHu: 'Szingapúr', defaultCurrency: 'SGD', defaultTimezone: 'Asia/Singapore', lat: 1.35, lng: 103.82 },
];

// Common timezones
export const TIMEZONES = [
  'Europe/Budapest',
  'Europe/Berlin',
  'Europe/Vienna',
  'Europe/London',
  'Europe/Paris',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Brussels',
  'Europe/Warsaw',
  'Europe/Prague',
  'Europe/Zurich',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Toronto',
  'America/Sao_Paulo',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
];

// Get country by code
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

// Get country flag emoji
export function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Format timezone for display
export function formatTimezone(tz: string): string {
  const parts = tz.split('/');
  return parts[parts.length - 1].replace(/_/g, ' ');
}
