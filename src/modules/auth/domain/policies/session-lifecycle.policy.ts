import {
  getSessionTimeLeftSec,
  isSessionAbsoluteLifetimeExceeded,
  isSessionApproachingExpiry,
  isSessionExpired,
  type SessionEntity,
} from "@/modules/auth/domain/entities/session.entity";

/**
 * Architectural actions to take based on session state evaluation.
 */
export type SessionLifecycleAction = "continue" | "rotate" | "terminate";

/** Session duration in seconds (15 minutes) */
export const SESSION_DURATION_SEC = 900 as const;
/** Threshold in seconds for triggering session rotation (2 minutes) */
export const SESSION_REFRESH_THRESHOLD_SEC = 120 as const;
/** Maximum absolute session lifetime in seconds (30 days) */
export const MAX_ABSOLUTE_SESSION_SEC = 2_592_000 as const;

/**
 * Domain Policy: Recognized reasons for terminating a session.
 */
export type TerminateSessionReason =
  | "absolute_limit_exceeded"
  | "expired"
  | "logout";

/**
 * Domain Policy: Reasons for session lifecycle decisions.
 */
export type SessionLifecycleReason =
  | "approaching_expiry"
  | "valid"
  | TerminateSessionReason;

export type SessionLifecycleTerminationDecision = Readonly<{
  readonly action: "terminate";
  readonly ageSec: number;
  readonly maxSec: number;
  readonly reason: "absolute_limit_exceeded" | "expired";
}>;

export type SessionLifecycleRotateDecision = Readonly<{
  readonly action: "rotate";
  readonly reason: "approaching_expiry";
  readonly timeLeftSec: number;
}>;

export type SessionLifecycleContinueDecision = Readonly<{
  readonly action: "continue";
  readonly reason: "valid";
  readonly timeLeftSec: number;
}>;

/**
 * Represents the structured result of a session lifecycle evaluation.
 */
export type SessionLifecycleDecision =
  | SessionLifecycleContinueDecision
  | SessionLifecycleRotateDecision
  | SessionLifecycleTerminationDecision;

/**
 * Pure function that evaluates the state of a session and decides on the next architectural action.
 *
 * @param session - The session entity to evaluate.
 * @param nowSec - Current UNIX timestamp in seconds.
 * @returns A decision object specifying the required action and reason.
 */
export function evaluateSessionLifecyclePolicy(
  session: SessionEntity,
  nowSec: number,
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
    return {
      action: "terminate",
      ageSec,
      maxSec: MAX_ABSOLUTE_SESSION_SEC,
      reason: "expired",
    };
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
): decision is SessionLifecycleRotateDecision {
  return decision.action === "rotate";
}

/**
 * Type guard to check if the session should be terminated.
 */
export function requiresTermination(
  decision: SessionLifecycleDecision,
): decision is SessionLifecycleTerminationDecision {
  return decision.action === "terminate";
}
