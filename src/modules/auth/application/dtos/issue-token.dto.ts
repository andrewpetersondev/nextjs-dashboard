import "server-only";

export type IssuedToken = Readonly<{
  expiresAtMs: number;
  token: string;
}>;
