/**
 * Format a number to Vietnamese currency string with thousand separators
 * 
 * @example
 * formatCurrency(1000)       // "1.000"
 * formatCurrency(250000)     // "250.000"
 * formatCurrency(1500000)    // "1.500.000"
 */
export const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9]/g, '')) : value;
  if (isNaN(num) || num === 0) return '';
  
  return num.toLocaleString('vi-VN');
};

/**
 * Format with currency suffix (đ)
 * 
 * @example
 * formatCurrencyWithSuffix(250000)  // "250.000 đ"
 */
export const formatCurrencyWithSuffix = (value: number | string): string => {
  const formatted = formatCurrency(value);
  return formatted ? `${formatted} đ` : '';
};

/**
 * Parse a formatted currency string back to a plain number string
 * Removes all non-digit characters
 * 
 * @example
 * parseCurrency("1.500.000 đ")  // "1500000"
 * parseCurrency("250.000")       // "250000"
 */
export const parseCurrency = (formatted: string): string => {
  return formatted.replace(/[^0-9]/g, '');
};

/**
 * Format a value for display in input field (on blur)
 * Shows the formatted number with thousand separators
 */
export const getDisplayPrice = (value: string): string => {
  const cleaned = value.replace(/[^0-9]/g, '');
  if (!cleaned) return '';
  return formatCurrency(cleaned);
};
