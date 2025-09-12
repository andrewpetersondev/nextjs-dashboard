import { NextResponse } from "next/server";
import { updateSessionToken } from "@/server/auth/session";

// Route handler to roll (refresh) the session token if it's near expiry.
// Safe to call repeatedly; it only re-issues when needed and respects absolute lifetime.
export async function POST(): Promise<NextResponse> {
  await updateSessionToken();
  const res = new NextResponse(null, { status: 204 });
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("Vary", "Cookie");
  return res;
}

export async function GET(): Promise<NextResponse> {
  await updateSessionToken();
  const res = new NextResponse(null, { status: 204 });
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("Vary", "Cookie");
  return res;
}

// Lightweight “are we fresh?” option; behaves like POST/GET but without a body.
// Some platforms may send periodic HEAD requests for liveness checks.
export async function HEAD(): Promise<NextResponse> {
  await updateSessionToken();
  const res = new NextResponse(null, { status: 204 });
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("Vary", "Cookie");
  return res;
}
