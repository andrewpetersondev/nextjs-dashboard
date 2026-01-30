import {
  MAX_ABSOLUTE_SESSION_SEC,
  SESSION_REFRESH_THRESHOLD_SEC,
} from "@/modules/auth/domain/constants/session-config.constants";
import {
  SESSION_LIFECYCLE_ACTIONS,
  SESSION_LIFECYCLE_REASONS,
  type SessionLifecycleAction,
  type SessionLifecycleReason,
} from "@/modules/auth/domain/constants/session-lifecycle.constants";
import {
  getSessionTimeLeftSec,
  isSessionAbsoluteLifetimeExceeded,
  isSessionApproachingExpiry,
  isSessionExpired,
  type SessionEntity,
} from "@/modules/auth/domain/entities/session.entity";

/**
 * Domain Policy: Recognized reasons for terminating a session.
 *
 * @remarks
 * This is a subset of `SessionLifecycleReason` (termination-only reasons).
 */
export type TerminateSessionReason = Extract<
  SessionLifecycleReason,
  | typeof SESSION_LIFECYCLE_REASONS.ABSOLUTE_LIMIT_EXCEEDED
  | typeof SESSION_LIFECYCLE_REASONS.EXPIRED
  | typeof SESSION_LIFECYCLE_REASONS.LOGOUT
>;

/**
 * Domain Policy: Reasons for session lifecycle decisions.
 *
 * @remarks
 * Includes both "non-terminal" reasons (continue/rotate) and termination reasons.
 */
export type SessionLifecycleDecisionReason =
  | Extract<
      SessionLifecycleReason,
      | typeof SESSION_LIFECYCLE_REASONS.APPROACHING_EXPIRY
      | typeof SESSION_LIFECYCLE_REASONS.VALID
    >
  | TerminateSessionReason;

export type SessionLifecycleTerminationDecision = Readonly<{
  readonly action: typeof SESSION_LIFECYCLE_ACTIONS.TERMINATE;
  readonly ageSec: number;
  readonly maxSec: number;
  readonly reason: TerminateSessionReason;
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
  decision: Readonly<{ action: SessionLifecycleAction }>,
): decision is SessionLifecycleRotateDecision {
  return decision.action === SESSION_LIFECYCLE_ACTIONS.ROTATE;
}

/**
 * Type guard to check if the session should be terminated.
 */
export function requiresTermination(
  decision: Readonly<{ action: SessionLifecycleAction }>,
): decision is SessionLifecycleTerminationDecision {
  return decision.action === SESSION_LIFECYCLE_ACTIONS.TERMINATE;
}
