import { NextResponse } from "next/server";
import { createSessionManagerFactory } from "@/modules/auth/server/application/services/factories/session-manager.factory";
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

export async function POST(): Promise<NextResponse> {
  const outcome = await createSessionManagerFactory().rotate();
  const res = NextResponse.json(outcome, { status: 200 });
  res.headers.set(HEADER_CACHE_CONTROL, CACHE_CONTROL_NO_STORE);
  res.headers.set(HEADER_PRAGMA, PRAGMA_NO_CACHE);
  res.headers.set(HEADER_EXPIRES, EXPIRES_IMMEDIATELY);
  res.headers.set(HEADER_VARY, VARY_COOKIE);
  return res;
}

export async function GET(): Promise<NextResponse> {
  const outcome = await createSessionManagerFactory().rotate();
  const res = NextResponse.json(outcome, { status: 200 });
  res.headers.set(HEADER_CACHE_CONTROL, CACHE_CONTROL_NO_STORE);
  res.headers.set(HEADER_PRAGMA, PRAGMA_NO_CACHE);
  res.headers.set(HEADER_EXPIRES, EXPIRES_IMMEDIATELY);
  res.headers.set(HEADER_VARY, VARY_COOKIE);
  return res;
}

export async function HEAD(): Promise<NextResponse> {
  await createSessionManagerFactory().rotate();
  const res = new NextResponse(null, { status: 204 });
  res.headers.set(HEADER_CACHE_CONTROL, CACHE_CONTROL_NO_STORE);
  res.headers.set(HEADER_PRAGMA, PRAGMA_NO_CACHE);
  res.headers.set(HEADER_EXPIRES, EXPIRES_IMMEDIATELY);
  res.headers.set(HEADER_VARY, VARY_COOKIE);
  return res;
}
