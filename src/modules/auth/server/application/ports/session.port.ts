import "server-only";
import type { AuthEncryptPayload } from "@/modules/auth/domain/sessions/session-payload.types";

export interface SessionPort {
  delete(): Promise<void>;
  get(): Promise<string | undefined>;
  set(value: string, expiresAtMs: number): Promise<void>;
}

export interface SessionTokenCodecPort {
  decode(token: string): Promise<AuthEncryptPayload | undefined>;
  encode(claims: AuthEncryptPayload, expiresAtMs: number): Promise<string>;
}
