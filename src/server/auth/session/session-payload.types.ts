import "server-only";
import type { z } from "zod";
import type {
  DecryptPayloadSchema,
  EncryptPayloadSchema,
} from "@/server/auth/domain/schemas/session-payload.schema";

// Inbound (untrusted) payload when creating/signing a session
export type EncryptPayloadInput = z.input<typeof EncryptPayloadSchema>;

// Outbound (validated) payload after parsing EncryptPayloadSchema
export type EncryptPayload = z.output<typeof EncryptPayloadSchema>;

// Outbound (validated) payload after decrypt/verify
export type DecryptPayload = z.output<typeof DecryptPayloadSchema>;
