/**
 * Central registry documenting all mappers in the auth module.
 *
 * This registry serves as a single source of truth for understanding:
 * - Where each mapper is located
 * - What transformation it performs
 * - Security implications of the transformation
 *
 * Organized by data flow direction (Infrastructure → Domain → Application → Presentation)
 */

export const MAPPER_REGISTRY = {
  "AppError → GenericAuthError": {
    file: "application/shared/mappers/flows/login/map-generic-auth.error.ts",
    flows: ["login", "signup"],
    layer: "application → presentation",
    purpose: "Maps generic authentication errors",
    security: "Normalizes error responses",
  },

  // ============================================================================
  // Application → Presentation (Error Mapping)
  // ============================================================================

  "AppError → LoginFormResult": {
    file: "application/shared/mappers/flows/login/to-login-form-result.mapper.ts",
    flows: ["login"],
    layer: "application → presentation",
    purpose: "Converts domain errors to UI-friendly login form errors",
    security: "Prevents credential enumeration attacks",
  },

  "AppError → SignupFormResult": {
    file: "application/shared/mappers/flows/signup/to-signup-form-result.mapper.ts",
    flows: ["signup"],
    layer: "application → presentation",
    purpose: "Converts domain errors to UI-friendly signup form errors",
    security: "Provides user-friendly error messages",
  },

  // ============================================================================
  // Application → Application (Cross-subdomain)
  // ============================================================================

  "AuthenticatedUserDto → SessionPrincipalDto": {
    file: "application/shared/mappers/flows/login/to-session-principal.mapper.ts",
    flows: ["login", "signup"],
    layer: "application → application",
    purpose: "Extracts only session-relevant data (id, role)",
    security: "Minimal data for JWT claims",
  },

  // ============================================================================
  // Domain → Application
  // ============================================================================

  "AuthUserEntity → AuthenticatedUserDto": {
    file: "application/shared/mappers/flows/login/to-authenticated-user.mapper.ts",
    flows: ["login", "signup"],
    layer: "domain → application",
    purpose: "Strips sensitive data (password) for application layer",
    security: "Removes password hash (security boundary)",
  },

  // ============================================================================
  // Infrastructure → Application (JWT)
  // ============================================================================

  "JWTPayload → SessionTokenClaimsDto": {
    file: "infrastructure/session/mappers/jwt-to-session-token-claims-dto.mapper.ts",
    flows: ["session-validation"],
    layer: "infrastructure → application",
    purpose: "Converts JWT payload to session token claims DTO",
    security: "Validates JWT structure and claims",
  },

  // ============================================================================
  // Infrastructure → Application (Error Mapping)
  // ============================================================================

  "PostgresError → SignupConflictError": {
    file: "application/shared/mappers/flows/signup/pg-unique-violation-to-signup-conflict-error.mapper.ts",
    flows: ["signup"],
    layer: "infrastructure → application",
    purpose: "Converts Postgres unique violation to signup conflict error",
    security: "Prevents database error leakage",
  },

  "SessionTokenClaimsDto → SessionTokenClaimsDto": {
    file: "application/session/mappers/to-session-token-claims-dto.mapper.ts",
    flows: ["session-validation"],
    layer: "application → application",
    purpose: "Maps session token claims to DTO",
    security: "Validates and normalizes token claims",
  },
  // ============================================================================
  // Infrastructure → Domain
  // ============================================================================

  "UserRow → AuthUserEntity": {
    file: "infrastructure/persistence/auth-user/mappers/to-auth-user-entity.mapper.ts",
    layer: "infrastructure → domain",
    purpose: "Converts database row to domain entity with branded types",
    security: "Includes password hash (sensitive)",
  },
} as const;

/**
 * Type-safe accessor for mapper information.
 */
export type MapperKey = keyof typeof MAPPER_REGISTRY;

/**
 * Get all mappers used in a specific flow.
 */
export function getMappersForFlow(flow: string): MapperKey[] {
  return Object.entries(MAPPER_REGISTRY)
    .filter(([_, info]) => info.flows?.includes(flow))
    .map(([key]) => key as MapperKey);
}
