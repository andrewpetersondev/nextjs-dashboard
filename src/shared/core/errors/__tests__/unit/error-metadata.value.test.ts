import { describe, expect, it } from "vitest";
import {
	isPgMetadata,
	isValidationMetadata,
} from "@/shared/core/errors/core/metadata/error-metadata.value";

/**
 * Unit tests for the metadata type guards (error-metadata.value.ts).
 *
 * These narrow an AppError's metadata so callers can safely read
 * validation-specific (fieldErrors/formErrors) or Postgres-specific (pgCode)
 * fields.
 */
describe("isValidationMetadata", () => {
	it.each([
		{ fieldErrors: { email: ["bad"] } },
		{ formErrors: ["bad"] },
	])("is true when validation fields are present: %p", (metadata) => {
		expect(isValidationMetadata(metadata)).toBe(true);
	});

	it.each([
		{},
		{ reason: "x" },
		{ pgCode: "23505" },
	])("is false otherwise: %p", (metadata) => {
		expect(isValidationMetadata(metadata)).toBe(false);
	});
});

describe("isPgMetadata", () => {
	it("is true when pgCode is present", () => {
		expect(isPgMetadata({ pgCode: "23505" })).toBe(true);
	});

	it.each([
		{},
		{ constraint: "x" },
		{ reason: "x" },
	])("is false when pgCode is absent: %p", (metadata) => {
		expect(isPgMetadata(metadata)).toBe(false);
	});
});
