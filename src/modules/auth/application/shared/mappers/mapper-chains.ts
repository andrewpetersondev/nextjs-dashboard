// NEW FILE: src/modules/auth/application/shared/mappers/mapper-chains.ts

/**
 * Documents the complete data transformation chains in the auth module.
 *
 * This file serves as a reference for understanding how data flows and
 * transforms between layers.
 */

export const AUTH_MAPPER_CHAINS = {
  login: {
    error: ["AppError → FormResult (toLoginFormResult)"],
    forward: [
      "UserRow → AuthUserEntity (toAuthUserEntity)",
      "AuthUserEntity → AuthenticatedUserDto (toAuthenticatedUserDto)",
      "AuthenticatedUserDto → SessionPrincipalDto (toSessionPrincipal)",
      "SessionPrincipalDto → IssuedTokenDto (SessionTokenService.issue)",
    ],
  },
  // ... other flows
} as const;
