import "server-only";

import type { UpdateSessionResult } from "@/modules/auth/domain/session/session-payload.types";
import type { SessionService } from "@/modules/auth/server/application/services/session.service";

/**
 * Refreshes (rotates) the current session token if needed.
 *
 * Note: this is an intentionally small workflow because SessionService.rotate()
 * already implements the session lifecycle rules.
 */
export async function refreshSessionWorkflow(
  deps: Readonly<{ sessionService: SessionService }>,
): Promise<UpdateSessionResult> {
  return await deps.sessionService.rotate();
}
