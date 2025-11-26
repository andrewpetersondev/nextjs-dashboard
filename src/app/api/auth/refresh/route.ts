import { NextResponse } from "next/server";
import { SessionManager } from "@/server/auth/application/services/session-manager.service";
import { createSessionCookieAdapter } from "@/server/auth/infrastructure/adapters/session-cookie.adapter";
import { createSessionJwtAdapter } from "@/server/auth/infrastructure/adapters/session-jwt.adapter";
import {
  CACHE_CONTROL_NO_STORE,
  EXPIRES_IMMEDIATELY,
  HEADER_CACHE_CONTROL,
  HEADER_EXPIRES,
  HEADER_PRAGMA,
  HEADER_VARY,
  PRAGMA_NO_CACHE,
  VARY_COOKIE,
} from "@/shared/http/http-headers";
import { logger } from "@/shared/logging/infra/logging.client";

function buildManager(): SessionManager {
  return new SessionManager(
    createSessionCookieAdapter(),
    createSessionJwtAdapter(),
    logger,
  );
}

export async function POST(): Promise<NextResponse> {
  const outcome = await buildManager().rotate();
  const res = NextResponse.json(outcome, { status: 200 });
  res.headers.set(HEADER_CACHE_CONTROL, CACHE_CONTROL_NO_STORE);
  res.headers.set(HEADER_PRAGMA, PRAGMA_NO_CACHE);
  res.headers.set(HEADER_EXPIRES, EXPIRES_IMMEDIATELY);
  res.headers.set(HEADER_VARY, VARY_COOKIE);
  return res;
}

export async function GET(): Promise<NextResponse> {
  const outcome = await buildManager().rotate();
  const res = NextResponse.json(outcome, { status: 200 });
  res.headers.set(HEADER_CACHE_CONTROL, CACHE_CONTROL_NO_STORE);
  res.headers.set(HEADER_PRAGMA, PRAGMA_NO_CACHE);
  res.headers.set(HEADER_EXPIRES, EXPIRES_IMMEDIATELY);
  res.headers.set(HEADER_VARY, VARY_COOKIE);
  return res;
}

export async function HEAD(): Promise<NextResponse> {
  await buildManager().rotate();
  const res = new NextResponse(null, { status: 204 });
  res.headers.set(HEADER_CACHE_CONTROL, CACHE_CONTROL_NO_STORE);
  res.headers.set(HEADER_PRAGMA, PRAGMA_NO_CACHE);
  res.headers.set(HEADER_EXPIRES, EXPIRES_IMMEDIATELY);
  res.headers.set(HEADER_VARY, VARY_COOKIE);
  return res;
}
