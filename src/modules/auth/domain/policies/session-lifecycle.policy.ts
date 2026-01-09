import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import {
  absoluteLifetimePolicy,
  MAX_ABSOLUTE_SESSION_MS,
  shouldRefreshTokenPolicy,
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
      reason: "expired" | "absolute_limit_exceeded";
      ageMs?: number;
      maxMs?: number;
    }>;

/**
 * Evaluates session lifecycle state and returns a pure decision.
 * No side effects - just determines what action should be taken.
 *
 * @param decoded - The decoded JWT payload containing session claims
 * @param sessionStart - The session start timestamp in milliseconds
 * @returns A decision indicating whether to continue, rotate, or terminate the session
 */
export function evaluateSessionLifecyclePolicy(
  decoded: SessionTokenClaims,
  sessionStart: number,
): SessionLifecycleDecision {
  const { age, exceeded } = absoluteLifetimePolicy({ sessionStart });

  if (exceeded) {
    return {
      action: "terminate",
      ageMs: age,
      maxMs: MAX_ABSOLUTE_SESSION_MS,
      reason: "absolute_limit_exceeded",
    };
  }

  const { refresh, timeLeftMs } = shouldRefreshTokenPolicy(decoded);

  if (timeLeftMs <= 0) {
    return {
      action: "terminate",
      reason: "expired",
    };
  }

  if (refresh) {
    return {
      action: "rotate",
      reason: "approaching_expiry",
      timeLeftMs,
    };
  }

  return {
    action: "continue",
    reason: "valid",
    timeLeftMs,
  };
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
