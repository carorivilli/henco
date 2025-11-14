import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a price for PDF reports with comma as decimal separator
 * @param price - The price as a number or string
 * @returns Formatted price string with comma separator (e.g., "1234,56")
 */
export function formatPriceForReport(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  const fixed = numPrice.toFixed(2);
  return fixed.replace('.', ',');
}
