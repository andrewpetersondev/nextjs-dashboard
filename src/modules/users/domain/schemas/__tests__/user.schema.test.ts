import { describe, expect, it } from "vitest";
import { EditUserFormSchema } from "@/modules/users/domain/schemas/user.schema";

/**
 * Regression coverage for the "leave password blank to keep current" behavior
 * on the edit-user form. A blank (or omitted) password must validate as
 * "unchanged" rather than being fed into the required password policy schema.
 */
describe("EditUserFormSchema", () => {
	const baseValidFields = {
		email: "editor@example.com",
		role: "USER",
		username: "editoruser",
	} as const;

	it("treats a blank password as 'keep current' (no validation error)", async () => {
		const result = await EditUserFormSchema.safeParseAsync({
			...baseValidFields,
			password: "",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.password).toBeUndefined();
		}
	});

	it("treats an omitted password the same as a blank one", async () => {
		const result = await EditUserFormSchema.safeParseAsync(baseValidFields);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.password).toBeUndefined();
		}
	});

	it("accepts and preserves a valid new password", async () => {
		const result = await EditUserFormSchema.safeParseAsync({
			...baseValidFields,
			password: "passw0rd!",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.password).toBe("passw0rd!");
		}
	});

	it("still rejects a provided-but-invalid password", async () => {
		const result = await EditUserFormSchema.safeParseAsync({
			...baseValidFields,
			password: "a1!", // below the minimum length
		});

		expect(result.success).toBe(false);
	});
});
