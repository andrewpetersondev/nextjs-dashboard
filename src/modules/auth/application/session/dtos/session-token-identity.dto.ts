/**
 * Token identity data needed by application flows.
 *
 * @remarks
 * This is intentionally separate from `SessionEntity` to avoid leaking token-specific
 * concepts into the domain model.
 */
export type SessionTokenIdentityDto = Readonly<{
  /** Session id claim (`sid`) from the session token */
  sid: string;
}>;
