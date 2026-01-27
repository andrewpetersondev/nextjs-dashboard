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
  | "invalid_token"
  | "user_logout";

/**
 * Domain Policy: Reasons for session lifecycle decisions.
 */
export type SessionLifecycleReason =
  | TerminateSessionReason
  | "approaching_expiry"
  | "valid";

/**
 * Represents the structured result of a session lifecycle evaluation.
 */
export type SessionLifecycleDecision =
  | Readonly<{
      /** No action needed, session is still valid */
      action: "continue";
      /** Reason: valid */
      reason: "valid";
      /** Seconds remaining until expiry */
      timeLeftSec: number;
    }>
  | Readonly<{
      /** Session should be rotated (renewed) */
      action: "rotate";
      /** Reason: approaching_expiry */
      reason: "approaching_expiry";
      /** Seconds remaining until current expiry */
      timeLeftSec: number;
    }>
  | Readonly<{
      /** Session must be terminated */
      action: "terminate";
      /** Specific reason for termination */
      reason: Extract<
        SessionLifecycleReason,
        "expired" | "absolute_limit_exceeded"
      >;
      /** Current age of the session in seconds */
      ageSec: number;
      /** Maximum allowed lifetime in seconds */
      maxSec: number;
    }>;

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
