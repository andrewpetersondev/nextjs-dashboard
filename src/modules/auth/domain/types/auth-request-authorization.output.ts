// TODO: this file may indicate the need for a AuthorizationRequestEntity

import type { AuthRequestAuthorizationReason } from "@/modules/auth/domain/types/auth-request-authorization-reason.type";

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
      reason: AuthRequestAuthorizationReason;
      /** Destination path for redirection */
      to: `/${string}`;
    }>;
