import { NextResponse } from "next/server";
import { updateSessionToken } from "@/server/auth/session";
import {
  CACHE_CONTROL_NO_STORE,
  EXPIRES_IMMEDIATELY,
  HEADER_CACHE_CONTROL,
  HEADER_EXPIRES,
  HEADER_PRAGMA,
  HEADER_VARY,
  PRAGMA_NO_CACHE,
  VARY_COOKIE,
} from "@/shared/auth/sessions/transport/http-headers";

// Route handler to roll (refresh) the session token if it's near expiry.
// Safe to call repeatedly; it only re-issues when needed and respects absolute lifetime.
export async function POST(): Promise<NextResponse> {
  const outcome = await updateSessionToken();
  const res = NextResponse.json(outcome, { status: 200 });
  res.headers.set(HEADER_CACHE_CONTROL, CACHE_CONTROL_NO_STORE);
  res.headers.set(HEADER_PRAGMA, PRAGMA_NO_CACHE);
  res.headers.set(HEADER_EXPIRES, EXPIRES_IMMEDIATELY);
  res.headers.set(HEADER_VARY, VARY_COOKIE);
  return res;
}

export async function GET(): Promise<NextResponse> {
  const outcome = await updateSessionToken();
  const res = NextResponse.json(outcome, { status: 200 });
  res.headers.set(HEADER_CACHE_CONTROL, CACHE_CONTROL_NO_STORE);
  res.headers.set(HEADER_PRAGMA, PRAGMA_NO_CACHE);
  res.headers.set(HEADER_EXPIRES, EXPIRES_IMMEDIATELY);
  res.headers.set(HEADER_VARY, VARY_COOKIE);
  return res;
}

// Lightweight “are we fresh?” option; responds like GET/POST but HEAD typically has no body.
export async function HEAD(): Promise<NextResponse> {
  await updateSessionToken();
  const res = new NextResponse(null, { status: 204 });
  res.headers.set(HEADER_CACHE_CONTROL, CACHE_CONTROL_NO_STORE);
  res.headers.set(HEADER_PRAGMA, PRAGMA_NO_CACHE);
  res.headers.set(HEADER_EXPIRES, EXPIRES_IMMEDIATELY);
  res.headers.set(HEADER_VARY, VARY_COOKIE);
  return res;
}
