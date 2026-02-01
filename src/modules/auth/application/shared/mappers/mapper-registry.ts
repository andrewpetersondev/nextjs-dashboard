// NEW: application/shared/mappers/mapper-registry.ts

export const MAPPER_REGISTRY = {
  // Application → Presentation
  "AppError → FormResult": {
    file: "presentation/authn/mappers/auth-form-error.mapper.ts",
    purpose: "Converts domain errors to UI-friendly form errors",
    security: "Prevents credential enumeration attacks",
  },

  // Application → Application (Session)
  "AuthenticatedUserDto → SessionPrincipalDto": {
    file: "application/session/mappers/to-session-principal.mapper.ts",
    purpose: "Extracts only session-relevant data (id, role)",
    security: "Minimal data for JWT claims",
  },

  // Domain → Application
  "AuthUserEntity → AuthenticatedUserDto": {
    file: "application/auth-user/mappers/to-authenticated-user.mapper.ts",
    purpose: "Strips sensitive data (password) for application layer",
    security: "Removes password hash (security boundary)",
  },
  // Infrastructure → Domain
  "UserRow → AuthUserEntity": {
    file: "infrastructure/persistence/auth-user/mappers/to-auth-user-entity.mapper.ts",
    purpose: "Converts database row to domain entity with branded types",
    security: "Includes password hash (sensitive)",
  },
} as const;
