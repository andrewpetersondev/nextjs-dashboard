export type AuthRequestAuthorizationReason =
  | "admin.not_authenticated"
  | "admin.not_authorized"
  | "decode_failed"
  | "no_cookie"
  | "protected.not_authenticated"
  | "public.bounce_authenticated";

export type AuthRequestAuthorizationOutcome =
  | Readonly<{ kind: "next"; reason: "ok" }>
  | Readonly<{
      kind: "redirect";
      reason: AuthRequestAuthorizationReason;
      to: `/${string}`;
    }>;
