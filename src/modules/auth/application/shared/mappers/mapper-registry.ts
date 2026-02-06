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

import type { FlowName } from "./mapper-chains";

type MapperRegistryInfo = {
  file: string;
  flows: readonly FlowName[];
  layer: string;
  purpose: string;
  security: string;
};

const defineMapperRegistry = <T extends Record<string, MapperRegistryInfo>>(
  registry: T,
): T => registry;

export const MAPPER_REGISTRY = defineMapperRegistry({
  "AppError → GenericAuthError": {
    file: "presentation/authn/mappers/map-generic-auth.error.ts",
    flows: ["login", "signup"],
    layer: "presentation → presentation",
    purpose: "Maps generic authentication errors",
    security: "Normalizes error responses",
  },

  // ============================================================================
  // Presentation Mappers (Application → Presentation)
  // ============================================================================

  "AppError → LoginFormResult": {
    file: "presentation/authn/mappers/to-login-form-result.mapper.ts",
    flows: ["login"],
    layer: "application → presentation",
    purpose: "Converts domain errors to UI-friendly login form errors",
    security: "Prevents credential enumeration attacks",
  },

  "AppError → SignupFormResult": {
    file: "presentation/authn/mappers/to-signup-form-result.mapper.ts",
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

  "IssueTokenCommand → SessionTokenClaimsDto": {
    file: "application/session/mappers/to-session-token-claims-dto.mapper.ts",
    flows: ["login", "signup"],
    layer: "application → application",
    purpose: "Maps token issuance command to claims DTO",
    security: "Encapsulates branded type transformation",
  },

  // ============================================================================
  // Infrastructure → Application (JWT)
  // ============================================================================

  "JWTPayload → SessionTokenClaimsDto": {
    file: "infrastructure/session/mappers/jwt-to-session-token-claims-dto.mapper.ts",
    flows: ["sessionValidation"],
    layer: "infrastructure → application",
    purpose: "Converts JWT payload to session token claims DTO",
    security: "Validates JWT structure and claims",
  },

  // ============================================================================
  // Presentation Adapters (Presentation → Application)
  // ============================================================================

  "LoginRequestDto → LoginCommand": {
    file: "presentation/authn/adapters/to-login-command.adapter.ts",
    flows: ["login"],
    layer: "presentation → application",
    purpose: "Adapts validated login form data to application command",
    security: "Boundary between UI and application core",
  },

  // ============================================================================
  // Infrastructure → Application (Error Mapping)
  // ============================================================================

  "PostgresError → SignupConflictError": {
    file: "infrastructure/persistence/auth-user/mappers/pg-unique-violation-to-signup-conflict-error.mapper.ts",
    flows: ["signup"],
    layer: "infrastructure → application",
    purpose: "Converts Postgres unique violation to signup conflict error",
    security: "Prevents database error leakage",
  },

  "SignupRequestDto → SignupCommand": {
    file: "presentation/authn/adapters/to-signup-command.adapter.ts",
    flows: ["signup"],
    layer: "presentation → application",
    purpose: "Adapts validated signup form data to application command",
    security: "Boundary between UI and application core",
  },
  // ============================================================================
  // Infrastructure → Domain
  // ============================================================================

  "UserRow → AuthUserEntity": {
    file: "infrastructure/persistence/auth-user/mappers/to-auth-user-entity.mapper.ts",
    flows: ["demoUser", "login", "signup"],
    layer: "infrastructure → domain",
    purpose: "Converts database row to domain entity with branded types",
    security: "Includes password hash (sensitive)",
  },
});

/**
 * Type-safe accessor for mapper information.
 */
export type MapperKey = keyof typeof MAPPER_REGISTRY;

/**
 * Get all mappers used in a specific flow.
 */
export function getMappersForFlow(flow: FlowName): MapperKey[] {
  return Object.entries(MAPPER_REGISTRY)
    .filter(([_, info]) => (info.flows as readonly FlowName[]).includes(flow))
    .map(([key]) => key as MapperKey);
}
