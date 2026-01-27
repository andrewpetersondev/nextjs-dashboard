import { parseUserRole } from "@/shared/domain/user/user-role.parser";
import type { UserRole } from "@/shared/domain/user/user-role.schema";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

/**
 * Domain Policy: Default Registration Role.
 *
 * @returns The default `UserRole` for new registrations.
 */
export function getDefaultRegistrationRole(): UserRole {
  return parseUserRole("USER");
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
    email: `demo+${role}${counter}@demo.com`,
    username: `Demo_${role.toUpperCase()}_${counter}`,
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
 * Creates a domain-specific error for invalid demo counters.
 *
 * @param cause - The original cause of the error.
 * @returns An `AppError` representing the validation failure.
 */
export function makeInvalidDemoCounterError(cause: unknown): AppError {
  return makeAppError(APP_ERROR_KEYS.validation, {
    cause: cause instanceof Error ? cause : String(cause),
    message: "Demo user counter returned invalid value",
    metadata: { policy: "registration" },
  });
}
