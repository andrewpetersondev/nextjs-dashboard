import { z } from "zod";

export const EncryptPayloadSchema = z.object({
	user: z.object({
		userId: z.string().uuid(),
		role: z.enum(["admin", "user"]),
		expiresAt: z.number(),
	}),
});

export type EncryptPayload = {
	user: {
		userId: string;
		role: string;
		expiresAt: number;
	};
};

export const DecryptPayloadSchema = EncryptPayloadSchema.extend({
	iat: z.number(),
	exp: z.number(),
});

export type DecryptPayload = z.infer<typeof DecryptPayloadSchema>;
