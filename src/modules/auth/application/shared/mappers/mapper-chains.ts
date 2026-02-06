/**
 * Documents the complete data transformation chains in the auth module.
 *
 * This file serves as a reference for understanding how data flows and
 * transforms between layers during different authentication and session operations.
 *
 * Each flow documents:
 * - Forward path: Successful data transformations from database to UI
 * - Error path: How errors are transformed and propagated to the UI
 *
 * @see {@link MAPPER_REGISTRY} for detailed information about each mapper
 */

export const AUTH_MAPPER_CHAINS = {
  /**
   * Demo User Creation Flow: Create temporary demo user
   *
   * Entry Point: demo-user.action.ts (Server Action)
   * Exit Point: Redirect to dashboard or form errors
   */
  demoUser: {
    error: [
      "1. Counter increment failure → demo_user_creation_failed",
      "2. (Same error handling as signup flow)",
    ],
    forward: [
      "1. UserRole → Demo username generation",
      "   Location: application/auth-user/commands/",
      "   Purpose: Generate unique demo username (e.g., demo-user-42)",
      "",
      "2. Demo data → AuthUserCreateDto",
      "   Location: application/auth-user/workflows/",
      "   Purpose: Prepare demo user creation data",
      "",
      "3. (Same as signup flow steps 2-7)",
    ],
  },
  /**
   * Login Flow: User authentication and session establishment
   *
   * Entry Point: login.action.ts (Server Action)
   * Exit Point: Redirect to dashboard or form errors
   */
  login: {
    error: [
      "1. AppError → LoginFormResult (toLoginFormResult)",
      "   Location: presentation/authn/mappers/",
      "   Purpose: Convert domain errors to UI form errors",
      "   Security: Prevents credential enumeration",
      "",
      "2. Specific error mappings:",
      "   - user_not_found → Generic 'Invalid credentials'",
      "   - invalid_password → Generic 'Invalid credentials'",
      "   - database_error → Generic 'Service unavailable'",
    ],
    forward: [
      "1. FormData → LoginRequestDto (Zod validation)",
      "   Location: presentation/authn/transports/",
      "   Purpose: Validate and normalize UI input",
      "",
      "2. LoginRequestDto → LoginCommand (toLoginCommand adapter)",
      "   Location: presentation/authn/adapters/",
      "   Purpose: Adapt validated form data to application command",
      "",
      "3. UserRow → AuthUserEntity (toAuthUserEntity)",
      "   Location: infrastructure/persistence/auth-user/mappers/",
      "   Purpose: Database row to domain entity with branded types",
      "",
      "4. AuthUserEntity → AuthenticatedUserDto (toAuthenticatedUserDto)",
      "   Location: application/shared/mappers/flows/login/",
      "   Purpose: Strip password hash (security boundary)",
      "",
      "5. AuthenticatedUserDto → SessionPrincipalDto (toSessionPrincipal)",
      "   Location: application/shared/mappers/flows/login/",
      "   Purpose: Extract minimal session data (id, role)",
      "",
      "6. SessionPrincipalDto → IssuedTokenDto (SessionTokenService.issue)",
      "   Location: infrastructure/session/services/",
      "   Purpose: Generate JWT with expiration claims",
      "",
      "7. IssuedTokenDto → HTTP Cookie (SessionCookieStoreAdapter.set)",
      "   Location: infrastructure/session/adapters/",
      "   Purpose: Set secure, HTTP-only session cookie",
    ],
  },

  /**
   * Session Rotation Flow: Refresh session token
   *
   * Entry Point: Session rotation middleware or explicit rotation
   * Exit Point: New session token in cookie
   */
  sessionRotation: {
    error: [
      "1. Invalid current session → Cannot rotate",
      "2. Token generation failure → session_rotation_failed",
    ],
    forward: [
      "1. Current SessionTokenClaimsDto → IssueRotatedTokenCommand",
      "   Location: application/session/commands/",
      "   Purpose: Prepare rotation request with current claims",
      "",
      "2. IssueRotatedTokenCommand → IssuedTokenDto",
      "   Location: infrastructure/session/services/",
      "   Purpose: Issue new token with updated expiration",
      "",
      "3. IssuedTokenDto → HTTP Cookie (replace existing)",
      "   Location: infrastructure/session/adapters/",
      "   Purpose: Update session cookie with new token",
    ],
  },

  /**
   * Session Termination Flow: Logout
   *
   * Entry Point: logout.action.ts (Server Action)
   * Exit Point: Cookie deleted, redirect to login
   */
  sessionTermination: {
    error: [
      "1. Cookie deletion failure → Log but continue",
      "2. Always redirect to login (logout is idempotent)",
    ],
    forward: [
      "1. SessionCookieStoreAdapter.delete()",
      "   Location: infrastructure/session/adapters/",
      "   Purpose: Remove session cookie",
      "",
      "2. Redirect to login page",
    ],
  },

  /**
   * Session Validation Flow: Verify and decode session token
   *
   * Entry Point: Session middleware or protected route
   * Exit Point: SessionVerificationDto or error
   */
  sessionValidation: {
    error: [
      "1. Missing cookie → session_not_found",
      "2. Invalid JWT signature → session_invalid",
      "3. Expired token → session_expired",
      "4. Invalid claims → session_invalid_claims",
      "5. Clock skew violation → session_invalid_semantics",
    ],
    forward: [
      "1. HTTP Cookie → JWT string (SessionCookieStoreAdapter.get)",
      "   Location: infrastructure/session/adapters/",
      "   Purpose: Extract token from cookie",
      "",
      "2. JWT string → JWTPayload (SessionTokenCodecAdapter.decode)",
      "   Location: infrastructure/session/adapters/",
      "   Purpose: Verify signature and decode JWT",
      "",
      "3. JWTPayload → SessionTokenClaimsDto (jwtToSessionTokenClaimsDto)",
      "   Location: infrastructure/session/mappers/",
      "   Purpose: Map JWT payload to application DTO",
      "",
      "4. SessionTokenClaimsDto → Validation (SessionTokenService.validate)",
      "   Location: infrastructure/session/services/",
      "   Purpose: Validate claims semantics (exp, iat, nbf)",
      "",
      "5. SessionTokenClaimsDto → SessionPrincipalDto",
      "   Location: application/session/queries/",
      "   Purpose: Extract user identity for authorization",
    ],
  },

  /**
   * Signup Flow: User registration and session establishment
   *
   * Entry Point: signup.action.ts (Server Action)
   * Exit Point: Redirect to dashboard or form errors
   */
  signup: {
    error: [
      "1. PostgresError (23505) → SignupConflictError",
      "   Location: infrastructure/persistence/auth-user/mappers/",
      "   Purpose: Convert unique violation to user-friendly error",
      "   Mapper: pgUniqueViolationToSignupConflictError",
      "",
      "2. AppError → SignupFormResult (toSignupFormResult)",
      "   Location: presentation/authn/mappers/",
      "   Purpose: Convert domain errors to UI form errors",
      "",
      "3. Specific error mappings:",
      "   - email_already_exists → Field error on email",
      "   - username_already_exists → Field error on username",
      "   - validation_error → Field-specific errors",
    ],
    forward: [
      "1. FormData → SignupRequestDto (Zod validation)",
      "   Location: presentation/authn/transports/",
      "   Purpose: Validate and normalize UI input",
      "",
      "2. SignupRequestDto → SignupCommand (toSignupCommand adapter)",
      "   Location: presentation/authn/adapters/",
      "   Purpose: Adapt validated form data to application command",
      "",
      "3. Password → Hash (PasswordHasherContract.hash)",
      "   Location: infrastructure/crypto/adapters/",
      "   Purpose: Hash password using bcrypt",
      "",
      "4. AuthUserCreateDto → UserRow (insertUserDal)",
      "   Location: infrastructure/persistence/auth-user/dal/",
      "   Purpose: Insert new user into database",
      "",
      "5. UserRow → AuthUserEntity (toAuthUserEntity)",
      "   Location: infrastructure/persistence/auth-user/mappers/",
      "   Purpose: Database row to domain entity",
      "",
      "6. AuthUserEntity → AuthenticatedUserDto (toAuthenticatedUserDto)",
      "   Location: application/shared/mappers/flows/login/",
      "   Purpose: Strip password hash",
      "",
      "7. AuthenticatedUserDto → SessionPrincipalDto (toSessionPrincipal)",
      "   Location: application/shared/mappers/flows/login/",
      "   Purpose: Extract session data",
      "",
      "8. SessionPrincipalDto → IssuedTokenDto → Cookie",
      "   (Same as login flow steps 6-7)",
    ],
  },
} as const;

/**
 * Type-safe accessor for flow chains.
 */
export type FlowName = keyof typeof AUTH_MAPPER_CHAINS;

export type FlowChain = (typeof AUTH_MAPPER_CHAINS)[FlowName];

/**
 * Get the complete transformation chain for a specific flow.
 */
export function getFlowChain(flow: FlowName): {
  forward: readonly string[];
  error: readonly string[];
} {
  return AUTH_MAPPER_CHAINS[flow];
}
