import "server-only";

import type { AuthUserEntity } from "@/modules/auth/domain/entities/auth-user.entity";

/**
 * Readonly credentials for a pre-seeded demo account.
 * Derived from AuthUserEntity, but uses string for the password to represent the plain-text credential.
 */
export type DemoAccount = Readonly<
  Omit<AuthUserEntity, "id" | "password"> & {
    readonly password: string;
  }
>;
