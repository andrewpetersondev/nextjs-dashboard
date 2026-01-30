import type { AuthRequestReason } from "@/modules/auth/domain/constants/auth-policy.constants";

/**
 * Represents the outcome of an authorization request check.
 * Used to determine if the request should proceed or be redirected.
 */
export type AuthRequestAuthorizationOutcome =
  | Readonly<{
      /** Request can proceed */
      kind: "next";
      /** Success reason */
      reason: "ok";
    }>
  | Readonly<{
      /** Request must be redirected */
      kind: "redirect";
      /** Reason for redirection */
      reason: AuthRequestReason;
      /** Destination path for redirection */
      to: `/${string}`;
    }>;
