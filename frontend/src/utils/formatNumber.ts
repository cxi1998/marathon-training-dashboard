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

/**
 * Format pace from decimal minutes to minutes:seconds format
 *
 * Examples:
 * - 6.83 → "6 mins 50 sec/mi"
 * - 7.00 → "7 mins/mi"
 * - 8.5 → "8 mins 30 sec/mi"
 */
export function formatPace(paceMinutes: number | null | undefined): string {
  if (paceMinutes === null || paceMinutes === undefined || isNaN(paceMinutes) || paceMinutes === 0) {
    return '—';
  }

  const minutes = Math.floor(paceMinutes);
  const seconds = Math.round((paceMinutes - minutes) * 60);

  if (seconds === 0) {
    return `${minutes} mins/mi`;
  }

  return `${minutes} mins ${seconds} sec/mi`;
}

/**
 * Format duration from decimal hours to hours and minutes format
 *
 * Examples:
 * - 7.5 → "7 hrs 30 mins"
 * - 8.0 → "8 hrs"
 * - 1.25 → "1 hr 15 mins"
 * - 0.5 → "30 mins"
 */
export function formatDuration(durationHours: number | null | undefined): string {
  if (durationHours === null || durationHours === undefined || isNaN(durationHours) || durationHours === 0) {
    return '—';
  }

  const hours = Math.floor(durationHours);
  const minutes = Math.round((durationHours - hours) * 60);

  // Less than 1 hour - show only minutes
  if (hours === 0) {
    return `${minutes} mins`;
  }

  // Exactly whole hours - show only hours
  if (minutes === 0) {
    return hours === 1 ? `${hours} hr` : `${hours} hrs`;
  }

  // Hours and minutes
  const hourLabel = hours === 1 ? 'hr' : 'hrs';
  return `${hours} ${hourLabel} ${minutes} mins`;
}

/**
 * Format activity duration from decimal minutes to minutes and seconds format
 *
 * Examples:
 * - 45.5 → "45 mins 30 sec"
 * - 60.0 → "60 mins"
 * - 32.75 → "32 mins 45 sec"
 */
export function formatActivityDuration(durationMinutes: number | null | undefined): string {
  if (durationMinutes === null || durationMinutes === undefined || isNaN(durationMinutes) || durationMinutes === 0) {
    return '—';
  }

  const minutes = Math.floor(durationMinutes);
  const seconds = Math.round((durationMinutes - minutes) * 60);

  if (seconds === 0) {
    return `${minutes} mins`;
  }

  return `${minutes} mins ${seconds} sec`;
}
