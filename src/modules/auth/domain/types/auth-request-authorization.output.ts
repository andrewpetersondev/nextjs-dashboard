// todo: this file may indicate the need for a AuthorizationRequestEntity

import type { AuthRequestAuthorizationReason } from "@/modules/auth/domain/types/auth-request-authorization-reason.type";

export type AuthRequestAuthorizationOutcome =
  | Readonly<{ kind: "next"; reason: "ok" }>
  | Readonly<{
      kind: "redirect";
      reason: AuthRequestAuthorizationReason;
      to: `/${string}`;
    }>;
