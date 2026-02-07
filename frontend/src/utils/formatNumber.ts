/**
 * Format a number to a maximum of 2 decimal places.
 * If the number is a whole number, no decimals are shown.
 *
 * Examples:
 * - 6.703101799600001 → 6.7
 * - 5.00 → 5
 * - 7.29 → 7.29
 * - 80 → 80
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  // Round to 2 decimal places
  const rounded = Math.round(value * 100) / 100;

  // If it's a whole number, return without decimals
  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }

  // Otherwise, return with up to 2 decimal places (removes trailing zeros)
  return rounded.toFixed(2).replace(/\.?0+$/, '');
}

/**
 * Format a number specifically for display (always shows appropriate precision)
 */
export function formatDecimal(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const rounded = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);

  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }

  return rounded.toFixed(decimals).replace(/\.?0+$/, '');
}
