/** biome-ignore-all lint/style/useNamingConvention: <bad rule> */
import "server-only";

/**
 * Password policy constants for authentication flows.
 *
 * @remarks
 * Different user types follow different password policies:
 *
 * - **Regular Users (Signup/Login)**:
 *   - Validated against schema rules (min 8 characters, etc.)
 *   - User-provided passwords are hashed before storage
 *
 * - **Demo Users**:
 *   - Randomly generated passwords for security
 *   - Length: 16 characters (alphanumeric + symbols)
 *   - Never exposed to users or logs
 */
export const AUTH_PASSWORD_POLICIES = {
  /**
   * Demo user password generation settings.
   */
  DEMO: {
    /**
     * Character length of randomly generated demo passwords.
     */
    LENGTH: 16,
    /**
     * Character sets used in password generation.
     */
    SETS: {
      ALPHANUMERIC: true,
      SYMBOLS: true,
    },
  },
  /**
   * Regular user password validation rules.
   */
  REGULAR: {
    /**
     * Minimum password length for regular users.
     */
    MIN_LENGTH: 8,
  },
} as const;
