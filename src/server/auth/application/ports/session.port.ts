import "server-only";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { FlatEncryptPayload } from "@/server/auth/domain/session/codecs/session-jwt-payload.mapper";

export interface SessionPort {
  delete(): Promise<void>;
  get(): Promise<string | undefined>;
  set(value: string, options: Partial<ResponseCookie>): Promise<void>;
}

export interface SessionTokenCodecPort {
  decode(token: string): Promise<FlatEncryptPayload | undefined>;
  encode(claims: FlatEncryptPayload, expiresAtMs: number): Promise<string>;
}
