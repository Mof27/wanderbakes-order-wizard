
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as dateFnsFormat } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to display in the format: 30 April 2025
 */
export function formatDate(date: Date | string | number): string {
  if (!date) return "-";
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateFnsFormat(dateObj, 'd MMMM yyyy');
}

/**
 * Formats a number as IDR currency: Rp 100.000
 */
export function formatCurrency(amount: number): string {
  if (!amount && amount !== 0) return "";
  
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(/\./g, "."); // Ensure dot as thousand separator
}

/**
 * Parses currency string input (e.g., "Rp 100.000") to a number
 */
export function parseCurrencyInput(input: string): number {
  if (!input) return 0;
  
  // Remove currency symbol, spaces, and replace dots with empty string
  const cleanedInput = input.replace(/[^\d]/g, "");
  return parseInt(cleanedInput, 10) || 0;
}

/**
 * Formats a time slot for display
 */
export function formatTimeSlot(slotKey: string): string {
  const timeSlots: Record<string, string> = {
    "slot1": "10.00 s/d 13.00 WIB",
    "slot2": "13.00 s/d 16.00 WIB",
    "slot3": "16.00 s/d 20.00 WIB"
  };
  
  return timeSlots[slotKey] || slotKey;
}
