import { AUTH_POLICY_NAMES } from "@/modules/auth/domain/constants/auth-policy.constants";
import { DEMO_IDENTITY_CONFIG } from "@/modules/auth/domain/constants/demo-identity.constants";
import {
  USER_ROLE,
  type UserRole,
} from "@/shared/domain/user/user-role.schema";

/**
 * Domain Policy: Default Registration Role.
 *
 * @returns The default `UserRole` for new registrations.
 */
export function getDefaultRegistrationRole(): UserRole {
  return USER_ROLE;
}

/**
 * Domain Policy: Demo User Identity Generation.
 *
 * @param role - The role for the demo user.
 * @param counter - A unique counter to ensure distinct identities.
 * @returns An object containing the generated email and username.
 */
export function generateDemoUserIdentity(
  role: UserRole,
  counter: number,
): { email: string; username: string } {
  return {
    email: `demo+${role}${counter}@${DEMO_IDENTITY_CONFIG.EMAIL_DOMAIN}`,
    username: `${DEMO_IDENTITY_CONFIG.USERNAME_PREFIX}_${role.toUpperCase()}_${counter}`,
  };
}

/**
 * Validates the demo user counter returned by the repository.
 *
 * @param counter - The value to validate.
 * @returns True if the counter is a positive number.
 */
export function validateDemoUserCounter(counter: unknown): counter is number {
  return typeof counter === "number" && counter > 0;
}

/**
 * Domain Policy: Registration failures.
 *
 * @remarks
 * Domain must not manufacture application error types (`AppError`) or depend on error catalogs.
 * Failures are modeled as domain values and mapped to `AppError` in outer layers.
 */
export const REGISTRATION_FAILURE_KINDS = {
  INVALID_DEMO_COUNTER: "invalid_demo_counter",
} as const;

export type RegistrationFailureKind =
  (typeof REGISTRATION_FAILURE_KINDS)[keyof typeof REGISTRATION_FAILURE_KINDS];

export type RegistrationFailure = Readonly<{
  readonly kind: RegistrationFailureKind;
  readonly policy: typeof AUTH_POLICY_NAMES.REGISTRATION;
}>;

/**
 * Creates a domain-specific failure value for invalid demo counters.
 */
export function makeInvalidDemoCounterFailure(): RegistrationFailure {
  return {
    kind: REGISTRATION_FAILURE_KINDS.INVALID_DEMO_COUNTER,
    policy: AUTH_POLICY_NAMES.REGISTRATION,
  };
}
