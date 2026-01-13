import "server-only";

import { JoseSessionTokenCodecAdapter } from "@/modules/auth/infrastructure/adapters/jose-session-token-codec.adapter";
import {
  SESSION_AUDIENCE,
  SESSION_ISSUER,
  SESSION_SECRET,
} from "@/server/config/env-server";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory for JoseSessionTokenCodecAdapter.
 */
export function createJoseSessionTokenCodecAdapter(
  logger: LoggingClientContract,
): JoseSessionTokenCodecAdapter {
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not defined");
  }

  return new JoseSessionTokenCodecAdapter(
    logger,
    SESSION_SECRET,
    SESSION_ISSUER,
    SESSION_AUDIENCE,
  );
}
