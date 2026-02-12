
export const formatCurrency = (value: number, currencyCode: string = 'USD'): string => {
  if (currencyCode === 'ZWG') {
    // Custom formatting for Zimbabwe Gold (ZiG)
    return `ZiG ${new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value)}`;
  }

  // Map currency codes to likely locales for better default formatting
  const localeMap: Record<string, string> = {
    'USD': 'en-US',
    'EUR': 'de-DE', // Or en-IE, fr-FR, etc.
    'GBP': 'en-GB',
    'ZAR': 'en-ZA',
  };

  const locale = localeMap[currencyCode] || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (error) {
    // Fallback if the currency code is invalid or unsupported in the environment
    return `${currencyCode} ${value.toFixed(0)}`;
  }
};

export const formatDate = (timestamp: number): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(timestamp));
};
