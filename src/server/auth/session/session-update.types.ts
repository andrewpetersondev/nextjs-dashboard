import "server-only";

/**
 * Re-issues the session JWT and updates the cookie if the current token is valid.
 * Must be called from server actions or route handlers.
 * Returns a structured outcome describing what occurred.
 */
export type UpdateSessionResult =
  | { readonly refreshed: false; readonly reason: "no_cookie" }
  | { readonly refreshed: false; readonly reason: "invalid_or_missing_user" }
  | {
      readonly refreshed: false;
      readonly reason: "absolute_lifetime_exceeded";
      readonly ageMs: number;
      readonly maxMs: number;
      readonly userId?: string;
    }
  | {
      readonly refreshed: false;
      readonly reason: "not_needed";
      readonly timeLeftMs: number;
    }
  | {
      readonly refreshed: true;
      readonly reason: "rotated";
      readonly expiresAt: number;
      readonly userId: string;
      readonly role: string;
    };
