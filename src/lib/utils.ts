import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a price for PDF reports with comma as decimal separator and dot as thousand separator
 * @param price - The price as a number or string
 * @returns Formatted price string with Spanish format (e.g., "84.000,99")
 */
export function formatPriceForReport(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
