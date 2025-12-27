import type { AuthUserRepositoryContract } from "@/modules/auth/server/application/contracts/auth-user-repository.contract";

/**
 * Transaction-scoped dependencies (DB-only).
 *
 * Rule: only database-backed contracts (repositories) belong here.
 * Do NOT add cookie/JWT/crypto/network contracts—those are not transactional.
 */
export type AuthTxDeps = Readonly<{
  authUsers: AuthUserRepositoryContract;
}>;
