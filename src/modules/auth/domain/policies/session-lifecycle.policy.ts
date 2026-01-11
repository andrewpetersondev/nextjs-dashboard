import {
  getSessionTimeLeftSec,
  isSessionAbsoluteLifetimeExceeded,
  isSessionApproachingExpiry,
  isSessionExpired,
  type SessionEntity,
} from "@/modules/auth/domain/entities/session.entity";
import {
  MAX_ABSOLUTE_SESSION_SEC,
  SESSION_REFRESH_THRESHOLD_SEC,
  type SessionLifecycleReason,
} from "@/modules/auth/domain/policies/session.policy";
import { MILLISECONDS_PER_SECOND } from "@/shared/constants/time.constants";

export type SessionLifecycleAction = "continue" | "rotate" | "terminate";

export type SessionLifecycleDecision =
  | Readonly<{
      action: "continue";
      reason: "valid";
      timeLeftSec: number;
    }>
  | Readonly<{
      action: "rotate";
      reason: "approaching_expiry";
      timeLeftSec: number;
    }>
  | Readonly<{
      action: "terminate";
      reason: Extract<
        SessionLifecycleReason,
        "expired" | "absolute_limit_exceeded"
      >;
      ageSec?: number;
      maxSec?: number;
    }>;

/**
 * Pure function that evaluates the state of a session and decides on the next architectural action.
 */
export function evaluateSessionLifecyclePolicy(
  session: SessionEntity,
  nowSec: number = Math.floor(Date.now() / MILLISECONDS_PER_SECOND),
): SessionLifecycleDecision {
  const { ageSec, exceeded } = isSessionAbsoluteLifetimeExceeded(
    session,
    MAX_ABSOLUTE_SESSION_SEC,
    nowSec,
  );

  if (exceeded) {
    return {
      action: "terminate",
      ageSec,
      maxSec: MAX_ABSOLUTE_SESSION_SEC,
      reason: "absolute_limit_exceeded",
    };
  }

  if (isSessionExpired(session, nowSec)) {
    return { action: "terminate", reason: "expired" };
  }

  const timeLeftSec = getSessionTimeLeftSec(session, nowSec);

  if (
    isSessionApproachingExpiry(session, SESSION_REFRESH_THRESHOLD_SEC, nowSec)
  ) {
    return { action: "rotate", reason: "approaching_expiry", timeLeftSec };
  }

  return { action: "continue", reason: "valid", timeLeftSec };
}

/**
 * Type guard to check if the session requires rotation.
 */
export function requiresRotation(
  decision: SessionLifecycleDecision,
): decision is Extract<SessionLifecycleDecision, { action: "rotate" }> {
  return decision.action === "rotate";
}

/**
 * Type guard to check if the session should be terminated.
 */
export function requiresTermination(
  decision: SessionLifecycleDecision,
): decision is Extract<SessionLifecycleDecision, { action: "terminate" }> {
  return decision.action === "terminate";
}
