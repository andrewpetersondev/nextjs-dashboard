import "server-only";

import { z } from "zod";
import { userRoleSchema } from "@/shared/domain/user/user-role.schema";

/**
 * Zod schema for validating session token claims at the Application boundary.
 *
 * Clean Architecture: This belongs in the Application layer as it defines the
 * requirements for data entering the application logic.
 */
export const SessionTokenClaimsSchema = z.strictObject({
  /** Expiration time (UNIX timestamp in seconds) */
  exp: z.number().int().positive(),
  /** Issued-at time (UNIX timestamp in seconds) */
  iat: z.number().int().positive(),
  /** User role - validated against shared domain enum */
  role: userRoleSchema,
  /** Subject: User identifier (UUID string) */
  sub: z.uuid(),
});

/**
 * Type derived from the schema to ensure synchronization.
 */
export type SessionTokenClaimsDto = z.output<typeof SessionTokenClaimsSchema>;
