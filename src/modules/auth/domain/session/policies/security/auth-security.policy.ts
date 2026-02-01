import {
  AUTH_POLICY_NAMES,
  AUTH_POLICY_REASONS,
} from "@/modules/auth/domain/shared/constants/auth-policy.constants";

/**
 * Domain Policy: Auth security failures.
 *
 * @remarks
 * Domain must stay independent from application error catalogs and factories.
 * This policy returns domain-level failure values (not `AppError`).
 */
export const AUTH_SECURITY_FAILURE_KINDS = {
  MISSING_SESSION: "missing_session",
} as const;

export type AuthSecurityFailureKind =
  (typeof AUTH_SECURITY_FAILURE_KINDS)[keyof typeof AUTH_SECURITY_FAILURE_KINDS];

export type AuthSecurityFailure = Readonly<{
  readonly kind: AuthSecurityFailureKind;
  readonly policy: typeof AUTH_POLICY_NAMES.SESSION_VERIFICATION;
  readonly reason: typeof AUTH_POLICY_REASONS.NO_TOKEN;
}>;

export const AuthSecurityFailures = {
  /** No session found in the request */
  missingSession: (): AuthSecurityFailure => ({
    kind: AUTH_SECURITY_FAILURE_KINDS.MISSING_SESSION,
    policy: AUTH_POLICY_NAMES.SESSION_VERIFICATION,
    reason: AUTH_POLICY_REASONS.NO_TOKEN,
  }),
};
