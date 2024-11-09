import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatAmount = (amount: string | number, decimals: number = 6): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = (value / Math.pow(10, decimals)).toFixed(decimals);
  return formatted.replace(/\.?0+$/, ''); // Remove trailing zeros
};
