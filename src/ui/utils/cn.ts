import { type ClassValue, clsx } from "clsx";

/**
 * Merges class names safely.
 * Note: If you add 'tailwind-merge' to your project later, wrap the result in twMerge().
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
