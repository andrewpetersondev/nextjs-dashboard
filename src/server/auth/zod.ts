import "server-only";

import * as z from "zod";

import { EncryptPayloadSchema } from "@/shared/auth/zod";

export const iatSchema = z.number();
export const expSchema = z.number();

export const DecryptPayloadSchema = EncryptPayloadSchema.extend({
  exp: expSchema,
  iat: iatSchema,
});
