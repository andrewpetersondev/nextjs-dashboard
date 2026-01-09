import "server-only";

import { readSessionToken } from "@/modules/auth/application/helpers/read-session-token.helper";
import type { UpdateSessionOutcome } from "@/modules/auth/domain/policies/session.policy";
import {
  evaluateSessionLifecycle,
  requiresRotation,
  requiresTermination,
} from "@/modules/auth/domain/policies/session-lifecycle.policy";
import { createSessionCookieAdapter } from "@/modules/auth/infrastructure/adapters/session-cookie.adapter";
import { createSessionTokenAdapter } from "@/modules/auth/infrastructure/adapters/session-token.adapter";
import type { createSessionServiceFactory } from "@/modules/auth/infrastructure/factories/session-service.factory";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Orchestrates the session rotation lifecycle.
 * Uses helpers and use-cases to decide whether to rotate, terminate, or skip.
 */
export async function rotateSessionWorkflow(deps: {
  sessionService: ReturnType<typeof createSessionServiceFactory>;
}): Promise<Result<UpdateSessionOutcome, AppError>> {
  const { sessionService } = deps;

  // 1. Read and decode the raw token claims for policy evaluation.
  // We use the helper directly because we need internal claims (exp, sessionStart)
  // that are stripped by the high-level 'verify'/'read' use cases.
  const readResult = await readSessionToken(
    {
      sessionCookieAdapter: createSessionCookieAdapter(),
      sessionTokenAdapter: createSessionTokenAdapter(),
    },
    { cleanupOnInvalidToken: true },
  );
  if (!readResult.ok) {
    return readResult;
  }

  const outcome = readResult.value;

  if (outcome.kind === "missing_token") {
    return Ok({ reason: "no_cookie", refreshed: false });
  }

  if (outcome.kind === "invalid_token") {
    return Ok({ reason: "invalid_or_missing_user", refreshed: false });
  }

  const { decoded } = outcome;

  if (!decoded.userId) {
    return Ok({ reason: "invalid_or_missing_user", refreshed: false });
  }

  // 2. Evaluate lifecycle policy using the raw claims
  const decision = evaluateSessionLifecycle(decoded, decoded.sessionStart);

  // 3. Branch based on policy decision
  if (requiresTermination(decision)) {
    const termResult = await sessionService.terminate(decision.reason);
    if (!termResult.ok) {
      return termResult;
    }

    return Ok({
      ageMs: decision.ageMs,
      maxMs: decision.maxMs,
      reason:
        decision.reason === "absolute_limit_exceeded"
          ? "absolute_lifetime_exceeded"
          : "invalid_or_missing_user",
      refreshed: false,
    });
  }

  if (requiresRotation(decision)) {
    return await sessionService.rotate();
  }

  return Ok({
    reason: "not_needed",
    refreshed: false,
    timeLeftMs: decision.timeLeftMs,
  });
}
