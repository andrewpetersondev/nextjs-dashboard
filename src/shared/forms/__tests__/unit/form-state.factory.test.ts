import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	makeInitialFormState,
	makeInitialFormStateFromSchema,
} from "@/shared/forms/logic/factories/form-state.factory";

/**
 * Unit tests for the initial form state factory (form-state.factory.ts).
 *
 * `useActionState` needs a state value before the first submission, and
 * `FormResult` has no idle member — so the initial state is a fake
 * validation-keyed Err with an empty message and empty dense field errors.
 * These tests pin that hack exactly as it is today; the "Tri-state form
 * state" BACKLOG item replaces it with an explicit `idle | ok | err` union.
 */
describe("form-state factory", () => {
	describe("makeInitialFormState", () => {
		it("is an Err with an empty message and a validation key", () => {
			const state = makeInitialFormState(["email", "password"]);

			expect(state.ok).toBe(false);
			if (!state.ok) {
				expect(state.error.key).toBe("validation");
				expect(state.error.message).toBe("");
			}
		});

		it("carries an empty dense field-error map for every field", () => {
			const state = makeInitialFormState(["email", "password"]);

			expect(state.ok).toBe(false);
			if (!state.ok) {
				expect(state.error.metadata).toEqual({
					fieldErrors: { email: [], password: [] },
					formData: {},
					formErrors: [],
				});
			}
		});

		it("serializes as a plain DTO so Next.js can encode it into the form", () => {
			const state = makeInitialFormState(["email"]);

			expect(state.ok).toBe(false);
			if (!state.ok) {
				expect(state.error).not.toBeInstanceOf(Error);
				expect(state.error._isAppError).toBe(true);
			}
		});
	});

	describe("makeInitialFormStateFromSchema", () => {
		it("derives the field set from the Zod object schema", () => {
			const schema = z.object({
				email: z.string(),
				password: z.string(),
			});

			const state = makeInitialFormStateFromSchema(schema);

			expect(state.ok).toBe(false);
			if (!state.ok) {
				expect(state.error.metadata).toEqual(
					expect.objectContaining({
						fieldErrors: { email: [], password: [] },
					}),
				);
			}
		});
	});
});
