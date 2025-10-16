import "server-only";
import type { z } from "zod";
import type {
  DecryptPayloadSchema,
  EncryptPayloadSchema,
} from "@/server/auth/domain/schemas/session-payload.schema";

// Derive types from schemas to avoid drift.
export type EncryptPayload = z.infer<typeof EncryptPayloadSchema>;
export type DecryptPayload = z.infer<typeof DecryptPayloadSchema>;
