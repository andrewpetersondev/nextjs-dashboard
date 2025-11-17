import "server-only";
import type { z } from "zod";
import type {
  DecryptPayloadSchema,
  EncryptPayloadSchema,
} from "@/server/auth/domain/session/validation/session-payload.schema";

// Outbound (validated) payload after parsing EncryptPayloadSchema
export type EncryptPayload = z.output<typeof EncryptPayloadSchema>;

// Outbound (validated) payload after decrypt/verify
export type DecryptPayload = z.output<typeof DecryptPayloadSchema>;
