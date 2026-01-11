export type AuthRequestAuthorizationReason =
  | "admin.not_authenticated"
  | "admin.not_authorized"
  | "decode_failed"
  | "no_cookie"
  | "protected.not_authenticated"
  | "public.bounce_authenticated";
