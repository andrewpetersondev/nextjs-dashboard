import type { UpdateSessionNotRotatedDto } from "@/modules/auth/application/dtos/update-session-not-rotated.dto";
import type { UpdateSessionSuccessDto } from "@/modules/auth/application/dtos/update-session-success.dto";

/**
 * Policy/outcome union for session refresh.
 *
 * - `refreshed: false` cases are expected outcomes (no cookie, not needed, policy exceeded, invalid user)
 * - operational failures are represented as `Err(AppError)` at the service boundary
 */
export type UpdateSessionOutcomeDto =
  | UpdateSessionNotRotatedDto
  | UpdateSessionSuccessDto;
