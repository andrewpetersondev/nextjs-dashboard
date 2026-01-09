import "server-only";

export type IssuedTokenDto = Readonly<{
  expiresAtMs: number;
  token: string;
}>;
