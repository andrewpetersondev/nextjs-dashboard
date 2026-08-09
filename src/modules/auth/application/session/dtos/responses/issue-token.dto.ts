/**
 * A freshly minted session token and when it lapses.
 *
 * `expiresAtMs` is in **milliseconds**, unlike the rest of the session stack,
 * which works in seconds via `UnixSeconds`. The unit is chosen so it can be
 * compared against `Date.now()` without conversion; anything with a `Sec`
 * suffix must be converted before it meets this value.
 */
export type IssuedTokenDto = Readonly<{
	expiresAtMs: number;
	token: string;
}>;
