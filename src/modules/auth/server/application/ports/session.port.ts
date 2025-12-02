import "server-only";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { FlatEncryptPayload } from "@/modules/auth/server/domain/session/types";

export interface SessionPort {
  delete(): Promise<void>;
  get(): Promise<string | undefined>;
  set(value: string, options: Partial<ResponseCookie>): Promise<void>;
}

export interface SessionTokenCodecPort {
  decode(token: string): Promise<FlatEncryptPayload | undefined>;
  encode(claims: FlatEncryptPayload, expiresAtMs: number): Promise<string>;
}
