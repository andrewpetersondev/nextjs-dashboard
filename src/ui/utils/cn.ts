import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Joins class names and resolves conflicting Tailwind utilities.
 *
 * `clsx` flattens the conditionals, then `twMerge` drops earlier utilities that
 * the later ones override — so a caller's `className` can beat a component's
 * default without `!important`.
 *
 * @example
 * cn("px-2 py-1", "px-4"); // "py-1 px-4"
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
