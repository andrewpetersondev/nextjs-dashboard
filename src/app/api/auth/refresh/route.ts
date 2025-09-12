import { NextResponse } from "next/server";
import { updateSessionToken } from "@/server/auth/session";

// Route handler to roll (refresh) the session token if it's near expiry.
// Safe to call repeatedly; it only re-issues when needed and respects absolute lifetime.
export async function POST(): Promise<NextResponse> {
  const outcome = await updateSessionToken();
  const res = NextResponse.json(outcome, { status: 200 });
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("Vary", "Cookie");
  return res;
}

export async function GET(): Promise<NextResponse> {
  const outcome = await updateSessionToken();
  const res = NextResponse.json(outcome, { status: 200 });
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("Vary", "Cookie");
  return res;
}

// Lightweight “are we fresh?” option; responds like GET/POST but HEAD typically has no body.
export async function HEAD(): Promise<NextResponse> {
  await updateSessionToken();
  const res = new NextResponse(null, { status: 204 });
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("Vary", "Cookie");
  return res;
}
