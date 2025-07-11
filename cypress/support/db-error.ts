import type { DbTaskResult } from "./types.ts";

export function createDbError<T>(
  error: string,
  errorMessage: string,
): DbTaskResult<T> {
  return {
    data: null,
    error,
    errorMessage,
    success: false,
  };
}

// Usage example in a Cypress test or task
// import { createDbError } from "./utils/dbError";

// ...
// if (!found) {
//   return createDbError<UserEntity>(ERROR_USER_NOT_FOUND, "User could not be found.");
// }
