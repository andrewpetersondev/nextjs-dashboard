import {
  getSessionTimeLeftMs,
  isSessionAbsoluteLifetimeExceeded,
  isSessionApproachingExpiry,
  isSessionExpired,
  type SessionEntity,
} from "@/modules/auth/domain/entities/session.entity";
import {
  MAX_ABSOLUTE_SESSION_MS,
  SESSION_REFRESH_THRESHOLD_MS,
  type SessionLifecycleReason,
} from "@/modules/auth/domain/policies/session.policy";

export type SessionLifecycleAction = "continue" | "rotate" | "terminate";

export type SessionLifecycleDecision =
  | Readonly<{
      action: "continue";
      reason: "valid";
      timeLeftMs: number;
    }>
  | Readonly<{
      action: "rotate";
      reason: "approaching_expiry";
      timeLeftMs: number;
    }>
  | Readonly<{
      action: "terminate";
      reason: Extract<
        SessionLifecycleReason,
        "expired" | "absolute_limit_exceeded"
      >;
      ageMs?: number;
      maxMs?: number;
    }>;

/**
 * Pure function that evaluates the state of a session and decides on the next architectural action.
 */
export function evaluateSessionLifecyclePolicy(
  session: SessionEntity,
  now: number = Date.now(),
): SessionLifecycleDecision {
  const { ageMs, exceeded } = isSessionAbsoluteLifetimeExceeded(
    session,
    MAX_ABSOLUTE_SESSION_MS,
    now,
  );

  if (exceeded) {
    return {
      action: "terminate",
      ageMs,
      maxMs: MAX_ABSOLUTE_SESSION_MS,
      reason: "absolute_limit_exceeded",
    };
  }

  if (isSessionExpired(session, now)) {
    return { action: "terminate", reason: "expired" };
  }

  const timeLeftMs = getSessionTimeLeftMs(session, now);

  if (isSessionApproachingExpiry(session, SESSION_REFRESH_THRESHOLD_MS, now)) {
    return { action: "rotate", reason: "approaching_expiry", timeLeftMs };
  }

  return { action: "continue", reason: "valid", timeLeftMs };
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
