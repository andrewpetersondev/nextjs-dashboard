import {
  SESSION_LIFECYCLE_ACTIONS,
  SESSION_LIFECYCLE_REASONS,
} from "@/modules/auth/domain/constants/auth-policy.constants";
import {
  getSessionTimeLeftSec,
  isSessionAbsoluteLifetimeExceeded,
  isSessionApproachingExpiry,
  isSessionExpired,
  type SessionEntity,
} from "@/modules/auth/domain/entities/session.entity";

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
  | typeof SESSION_LIFECYCLE_REASONS.ABSOLUTE_LIMIT_EXCEEDED
  | typeof SESSION_LIFECYCLE_REASONS.EXPIRED
  | typeof SESSION_LIFECYCLE_REASONS.LOGOUT;

/**
 * Domain Policy: Reasons for session lifecycle decisions.
 */
export type SessionLifecycleReason =
  | typeof SESSION_LIFECYCLE_REASONS.APPROACHING_EXPIRY
  | typeof SESSION_LIFECYCLE_REASONS.VALID
  | TerminateSessionReason;

export type SessionLifecycleTerminationDecision = Readonly<{
  readonly action: typeof SESSION_LIFECYCLE_ACTIONS.TERMINATE;
  readonly ageSec: number;
  readonly maxSec: number;
  readonly reason: SessionLifecycleReason;
}>;

export type SessionLifecycleRotateDecision = Readonly<{
  readonly action: typeof SESSION_LIFECYCLE_ACTIONS.ROTATE;
  readonly reason: typeof SESSION_LIFECYCLE_REASONS.APPROACHING_EXPIRY;
  readonly timeLeftSec: number;
}>;

export type SessionLifecycleContinueDecision = Readonly<{
  readonly action: typeof SESSION_LIFECYCLE_ACTIONS.CONTINUE;
  readonly reason: typeof SESSION_LIFECYCLE_REASONS.VALID;
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
      action: SESSION_LIFECYCLE_ACTIONS.TERMINATE,
      ageSec,
      maxSec: MAX_ABSOLUTE_SESSION_SEC,
      reason: SESSION_LIFECYCLE_REASONS.ABSOLUTE_LIMIT_EXCEEDED,
    };
  }

  if (isSessionExpired(session, nowSec)) {
    return {
      action: SESSION_LIFECYCLE_ACTIONS.TERMINATE,
      ageSec,
      maxSec: MAX_ABSOLUTE_SESSION_SEC,
      reason: SESSION_LIFECYCLE_REASONS.EXPIRED,
    };
  }

  const timeLeftSec = getSessionTimeLeftSec(session, nowSec);

  if (
    isSessionApproachingExpiry(session, SESSION_REFRESH_THRESHOLD_SEC, nowSec)
  ) {
    return {
      action: SESSION_LIFECYCLE_ACTIONS.ROTATE,
      reason: SESSION_LIFECYCLE_REASONS.APPROACHING_EXPIRY,
      timeLeftSec,
    };
  }

  return {
    action: SESSION_LIFECYCLE_ACTIONS.CONTINUE,
    reason: SESSION_LIFECYCLE_REASONS.VALID,
    timeLeftSec,
  };
}

/**
 * Type guard to check if the session requires rotation.
 */
export function requiresRotation(
  decision: SessionLifecycleDecision,
): decision is SessionLifecycleRotateDecision {
  return decision.action === SESSION_LIFECYCLE_ACTIONS.ROTATE;
}

/**
 * Type guard to check if the session should be terminated.
 */
export function requiresTermination(
  decision: SessionLifecycleDecision,
): decision is SessionLifecycleTerminationDecision {
  return decision.action === SESSION_LIFECYCLE_ACTIONS.TERMINATE;
}
