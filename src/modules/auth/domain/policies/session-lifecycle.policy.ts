import {
  getSessionTimeLeftSec,
  isSessionAbsoluteLifetimeExceeded,
  isSessionApproachingExpiry,
  isSessionExpired,
  type SessionEntity,
} from "@/modules/auth/domain/entities/session.entity";
import { nowInSeconds } from "@/shared/constants/time.constants";

export type SessionLifecycleAction = "continue" | "rotate" | "terminate";

export const SESSION_DURATION_SEC = 900 as const; // 15 minutes
export const SESSION_REFRESH_THRESHOLD_SEC = 120 as const; // 2 minutes
export const MAX_ABSOLUTE_SESSION_SEC = 2_592_000 as const; // 30 days
/**
 * Domain Policy: Recognized reasons for terminating a session.
 */
export type TerminateSessionReason =
  | "absolute_limit_exceeded"
  | "expired"
  | "invalid_token"
  | "user_logout";
/**
 * Domain Policy: Reasons for session lifecycle decisions.
 */
export type SessionLifecycleReason =
  | TerminateSessionReason
  | "approaching_expiry"
  | "valid";

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
  nowSec: number = nowInSeconds(),
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
