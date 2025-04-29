
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as dateFnsFormat } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to display in the format: 1 Jan 2025
 */
export function formatDate(date: Date | string | number): string {
  if (!date) return "-";
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateFnsFormat(dateObj, 'd MMM yyyy');
}

/**
 * Formats a number as IDR currency: Rp 100.000
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
