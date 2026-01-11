import "server-only";

import type { SessionServiceContract } from "@/modules/auth/application/contracts/session-service.contract";
import type { UpdateSessionOutcomeDto } from "@/modules/auth/application/dtos/update-session-outcome.dto";
import { readSessionTokenHelper } from "@/modules/auth/application/helpers/read-session-token.helper";
import { buildSession } from "@/modules/auth/domain/entities/session.entity";
import {
  evaluateSessionLifecyclePolicy,
  requiresRotation,
  requiresTermination,
} from "@/modules/auth/domain/policies/session-lifecycle.policy";
import { userIdCodec } from "@/modules/auth/domain/schemas/auth-session.schema";
import { createSessionCookieAdapter } from "@/modules/auth/infrastructure/adapters/session-cookie.adapter";
import { createSessionTokenAdapter } from "@/modules/auth/infrastructure/adapters/session-token.adapter";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

// todo: why is this not used? replace the adapters to use use cases and helpers. refactor this to use use-cases and
//  helpers, not adapters directly. how can i actually implement this workflow in the app?

/**
 * Orchestrates the session rotation lifecycle.
 * Uses helpers and use-cases to decide whether to rotate, terminate, or skip.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <why is this function not used?>
export async function rotateSessionWorkflow(deps: {
  sessionService: SessionServiceContract;
}): Promise<Result<UpdateSessionOutcomeDto, AppError>> {
  const { sessionService } = deps;

  // 1. Read and decode the raw token claims for policy evaluation.
  // We use the helper directly because we need internal claims (exp, sessionStart)
  // that are stripped by the high-level 'verify'/'read' use cases.
  const readResult = await readSessionTokenHelper(
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

  // 1. Map raw claims to Domain Entity
  const session = buildSession({
    expiresAt: decoded.expiresAt,
    issuedAt: decoded.iat * 1000,
    role: decoded.role,
    sessionStart: decoded.sessionStart,
    userId: userIdCodec.decode(decoded.userId),
  });

  // 2. Evaluate lifecycle policy using the Domain Entity
  const decision = evaluateSessionLifecyclePolicy(session);

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
