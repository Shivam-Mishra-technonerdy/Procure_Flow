// Supported Currencies
export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
];

// ISO Countries List
export const ISO_COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳', phoneCode: '+91' },
  { code: 'US', name: 'United States', flag: '🇺🇸', phoneCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phoneCode: '+44' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', phoneCode: '+44' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', phoneCode: '+49' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', phoneCode: '+81' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', phoneCode: '+82' },
  { code: 'CN', name: 'China', flag: '🇨🇳', phoneCode: '+86' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', phoneCode: '+886' },
  { code: 'FR', name: 'France', flag: '🇫🇷', phoneCode: '+33' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', phoneCode: '+39' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', phoneCode: '+34' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', phoneCode: '+31' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', phoneCode: '+41' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', phoneCode: '+46' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', phoneCode: '+45' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', phoneCode: '+55' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', phoneCode: '+966' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', phoneCode: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', phoneCode: '+61' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', phoneCode: '+65' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', phoneCode: '+971' },
];

export const getCountryName = (code) => {
  if (!code) return '';
  const found = ISO_COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return found ? found.name : code;
};

export const getCountryFlag = (code) => {
  if (!code) return '🌐';
  const found = ISO_COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return found ? found.flag : '🌐';
};

// Common International Phone Country Codes
export const PHONE_COUNTRY_CODES = [
  { code: '+91', label: '+91 (India)' },
  { code: '+1', label: '+1 (US / Canada)' },
  { code: '+44', label: '+44 (UK)' },
  { code: '+61', label: '+61 (Australia)' },
  { code: '+49', label: '+49 (Germany)' },
  { code: '+33', label: '+33 (France)' },
  { code: '+65', label: '+65 (Singapore)' },
  { code: '+971', label: '+971 (UAE)' },
  { code: '+81', label: '+81 (Japan)' },
];

// Get currency symbol
export const getCurrencySymbol = (currencyCode = 'INR') => {
  return (currencyCode || '').toUpperCase() === 'USD' ? '$' : '₹';
};

// Format currency supporting INR and USD
export const formatCurrency = (amount, currencyCode = 'INR') => {
  const val = parseFloat(amount) || 0;
  const curr = (currencyCode || 'INR').toUpperCase();
  const locale = curr === 'USD' ? 'en-US' : 'en-IN';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  } catch (e) {
    const sym = getCurrencySymbol(curr);
    return `${sym}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

// Format ISO date/datetime string
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  if (includeTime) {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Normalize role strings (handles ROLE_ADMIN -> ADMIN)
export const normalizeRole = (role) => {
  if (!role) return '';
  const clean = role.replace(/^ROLE_/, '').toUpperCase();
  return clean; // 'ADMIN' | 'BUYER' | 'SUPPLIER'
};

// Get default redirect route for a role
export const getRoleDashboard = (role) => {
  const norm = normalizeRole(role);
  if (norm === 'ADMIN') return '/admin/dashboard';
  if (norm === 'SUPPLIER') return '/supplier/dashboard';
  return '/buyer/dashboard';
};