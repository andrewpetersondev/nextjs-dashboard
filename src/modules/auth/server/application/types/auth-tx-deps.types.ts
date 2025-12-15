import type { AuthUserRepositoryPort } from "@/modules/auth/server/application/ports/auth-user-repository.port";

/**
 * Transaction-scoped dependencies (DB-only).
 *
 * Rule: only database-backed ports (repositories) belong here.
 * Do NOT add cookie/JWT/crypto/network ports—those are not transactional.
 */
export type AuthTxDeps = Readonly<{
  authUsers: AuthUserRepositoryPort;
}>;
