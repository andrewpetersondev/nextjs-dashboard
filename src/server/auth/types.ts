import "server-only";

import type { EncryptPayload } from "@/shared/auth/sessions/zod";

// Payload after decrypting a session (includes JWT claims).
export interface DecryptPayload extends EncryptPayload {
  iat: number; // Issued at (Unix timestamp)
  exp: number; // Expiration (Unix timestamp)
}
