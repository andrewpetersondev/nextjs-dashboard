/**
 * Shared Tailwind class utilities for buttons/links.
 * Keep as plain strings to reuse across components without coupling to Next.js runtime.
 */
const ANCHOR_BUTTON_BASE_CLASSES =
  "flex items-center justify-center gap-3 rounded-md text-sm font-semibold";

const ANCHOR_BUTTON_FOCUS_RING_CLASSES =
  "ring-1 focus-visible:ring-2 ring-bg-accent focus-visible:ring-bg-focus";

const ANCHOR_BUTTON_PADDING_SIZES = {
  md: "px-4 py-2.5",
  sm: "px-3 py-2",
} as const;

/**
 * Default variant used by SocialLoginButton to match prior design.
 */

export const SOCIAL_ANCHOR_BUTTON_CLASSES = [
  "bg-bg-primary text-text-primary hover:bg-bg-accent",
  ANCHOR_BUTTON_BASE_CLASSES,
  ANCHOR_BUTTON_FOCUS_RING_CLASSES,
  "w-full",
  ANCHOR_BUTTON_PADDING_SIZES.sm,
].join(" ");
