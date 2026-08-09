import { describe, expect, it } from "vitest";
import {
	CreateCustomerFormSchema,
	EditCustomerFormSchema,
} from "@/modules/customers/domain/customer.schema";

describe("CreateCustomerFormSchema", () => {
	it("normalizes the name and email before validating", () => {
		const parsed = CreateCustomerFormSchema.parse({
			email: "  AMY@Burns.COM ",
			name: "  Amy   Burns  ",
		});

		expect(parsed).toEqual({ email: "amy@burns.com", name: "Amy Burns" });
	});

	it("rejects a whitespace-only name instead of storing it blank", () => {
		// The transform runs first, so "   " becomes "" and then fails the
		// minimum-length check — it is never persisted as an empty name.
		expect(
			CreateCustomerFormSchema.safeParse({
				email: "amy@burns.com",
				name: "   ",
			}).success,
		).toBe(false);
	});

	it("rejects a name shorter than the minimum", () => {
		expect(
			CreateCustomerFormSchema.safeParse({ email: "a@b.com", name: "A" })
				.success,
		).toBe(false);
	});

	it("rejects an invalid email", () => {
		expect(
			CreateCustomerFormSchema.safeParse({ email: "nope", name: "Amy Burns" })
				.success,
		).toBe(false);
	});

	it("rejects unknown keys, so a stray field cannot reach the database", () => {
		expect(
			CreateCustomerFormSchema.safeParse({
				email: "amy@burns.com",
				imageUrl: "/evil.png",
				name: "Amy Burns",
			}).success,
		).toBe(false);
	});

	it("requires both fields", () => {
		expect(
			CreateCustomerFormSchema.safeParse({ name: "Amy Burns" }).success,
		).toBe(false);
	});
});

describe("EditCustomerFormSchema", () => {
	it("treats a blank field as 'leave unchanged', not as a validation error", () => {
		const parsed = EditCustomerFormSchema.parse({ email: "", name: "" });

		expect(parsed).toEqual({ email: undefined, name: undefined });
	});

	it("accepts an entirely absent field", () => {
		expect(EditCustomerFormSchema.parse({})).toEqual({});
	});

	it("still validates a field that was actually filled in", () => {
		expect(
			EditCustomerFormSchema.safeParse({ email: "nope", name: "" }).success,
		).toBe(false);
	});

	it("normalizes a filled field the same way create does", () => {
		const parsed = EditCustomerFormSchema.parse({
			email: " AMY@Burns.com ",
			name: "  Amy   Burns ",
		});

		expect(parsed).toEqual({ email: "amy@burns.com", name: "Amy Burns" });
	});
});
