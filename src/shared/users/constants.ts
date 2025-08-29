/**
 * User-related validation constants safe for client and server usage.
 *
 * Colocated under shared/users to keep related logic near user DTOs and schemas.
 */
export const DEFAULT_USER_SCHEMA = {
  PASSWORD_MAX_LENGTH: 32,
  PASSWORD_MIN_LENGTH: 5,
  USERNAME_MAX_LENGTH: 20,
  USERNAME_MIN_LENGTH: 3,
} as const;

export const TIMER_DELAY = 4000;
