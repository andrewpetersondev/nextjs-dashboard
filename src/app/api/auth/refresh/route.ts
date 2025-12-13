import { NextResponse } from "next/server";
import { createSessionServiceFactory } from "@/modules/auth/server/application/services/factories/session-service.factory";
import { refreshSessionWorkflow } from "@/modules/auth/server/application/workflows/refresh-session.workflow";
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
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";

function applyNoStoreHeaders(res: NextResponse): NextResponse {
  res.headers.set(HEADER_CACHE_CONTROL, CACHE_CONTROL_NO_STORE);
  res.headers.set(HEADER_PRAGMA, PRAGMA_NO_CACHE);
  res.headers.set(HEADER_EXPIRES, EXPIRES_IMMEDIATELY);
  res.headers.set(HEADER_VARY, VARY_COOKIE);
  return res;
}

async function rotateSession(): Promise<
  ReturnType<typeof refreshSessionWorkflow>
> {
  const requestId = crypto.randomUUID();
  const logger = defaultLogger.withContext("auth:route").withRequest(requestId);
  const sessionService = createSessionServiceFactory(logger);
  return await refreshSessionWorkflow({ sessionService });
}

export async function POST(): Promise<NextResponse> {
  const outcome = await rotateSession();
  return applyNoStoreHeaders(NextResponse.json(outcome, { status: 200 }));
}

export async function GET(): Promise<NextResponse> {
  const outcome = await rotateSession();
  return applyNoStoreHeaders(NextResponse.json(outcome, { status: 200 }));
}

export async function HEAD(): Promise<NextResponse> {
  await rotateSession();
  return applyNoStoreHeaders(new NextResponse(null, { status: 204 }));
}
