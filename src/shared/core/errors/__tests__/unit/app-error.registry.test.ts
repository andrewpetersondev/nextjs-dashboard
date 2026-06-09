import { describe, expect, it } from "vitest";
import {
	APP_ERROR_KEYS,
	getAppErrorDefinition,
	getMetadataSchemaForKey,
} from "@/shared/core/errors/core/catalog/app-error.registry";

/**
 * Unit tests for the AppError registry (app-error.registry.ts).
 *
 * The registry is the single source of truth mapping each error key to its
 * layer, severity, description and metadata schema. These tests guard a known
 * entry and assert the registry stays complete and self-consistent for every
 * key (so a new key can't be added without its definition).
 */
describe("AppError registry", () => {
	it("returns the definition for a known key", () => {
		expect(getAppErrorDefinition("conflict")).toMatchObject({
			description: "Resource state conflict",
			layer: "API",
			retryable: false,
			severity: "WARN",
		});
	});

	it("has a complete, self-consistent definition for every key", () => {
		for (const key of Object.values(APP_ERROR_KEYS)) {
			const definition = getAppErrorDefinition(key);

			expect(definition).toBeDefined();
			expect(typeof definition.description).toBe("string");
			expect(definition.metadataSchema).toBeDefined();
		}
	});

	it("exposes a usable zod schema per key", () => {
		const schema = getMetadataSchemaForKey("validation");

		expect(schema.parse({ reason: "x" })).toEqual({ reason: "x" });
	});
});
