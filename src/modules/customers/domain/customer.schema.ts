import { z } from "zod";
import {
	CUSTOMER_NAME_MAX_LENGTH,
	CUSTOMER_NAME_MAX_LENGTH_ERROR,
	CUSTOMER_NAME_MIN_LENGTH,
	CUSTOMER_NAME_MIN_LENGTH_ERROR,
	normalizeCustomerName,
} from "@/modules/customers/domain/customer-policy";
import { EmailSchema } from "@/shared/policies/email/email.schema";

/**
 * Validate and normalize a customer's display name.
 *
 * Normalizes first, then enforces policy on the canonical value — the same
 * transform-then-pipe order as `UsernameSchema` and `EmailSchema`, so a name
 * of pure whitespace is rejected instead of stored blank.
 */
const CustomerNameSchema = z
	.string()
	.transform(normalizeCustomerName)
	.pipe(
		z
			.string()
			.min(CUSTOMER_NAME_MIN_LENGTH, { error: CUSTOMER_NAME_MIN_LENGTH_ERROR })
			.max(CUSTOMER_NAME_MAX_LENGTH, { error: CUSTOMER_NAME_MAX_LENGTH_ERROR }),
	);

// biome-ignore lint/nursery/useExplicitType: inferred Zod type is the source of truth
const toUndefinedIfEmptyString = (v: unknown) =>
	typeof v === "string" && v.trim() === "" ? undefined : v;

// biome-ignore lint/nursery/useExplicitType: inferred Zod type is the source of truth
function optionalEdit<T extends z.ZodType>(schema: T) {
	// Empty string means "leave unchanged": preprocess turns "" into undefined,
	// and the inner .optional() accepts that undefined. Without the inner
	// optional, a blank field would feed undefined into the required base schema
	// and fail validation. Mirrors the same helper in `users`.
	return z.preprocess(toUndefinedIfEmptyString, schema.optional()).optional();
}

/**
 * Create schema. `strictObject` rejects unknown keys early.
 *
 * `imageUrl` is deliberately absent: avatars are local files under
 * `public/customers/`, so there is nothing for a user to supply. New customers
 * render an initials avatar instead — see `CUSTOMER_IMAGE_URL_NONE`.
 */
export const CreateCustomerFormSchema = z.strictObject({
	email: EmailSchema,
	name: CustomerNameSchema,
});

/**
 * Edit schema with every field optional after preprocessing, so a blank input
 * means "leave unchanged" rather than "clear this field".
 */
export const EditCustomerFormSchema = z.strictObject({
	email: optionalEdit(EmailSchema),
	name: optionalEdit(CustomerNameSchema),
});

/**
 * The field names both write forms use.
 *
 * Derived from the schema's INPUT type, not its output: the input is the
 * pre-parse form shape, which is what the DOM `name` attributes must match.
 * Derived rather than hand-written so adding a field to the schema cannot leave
 * a literal union silently behind — and taken from the edit schema because both
 * schemas carry the same field set, edit just makes each one optional.
 */
export type CustomerWriteFieldNames = keyof z.input<
	typeof EditCustomerFormSchema
>;

// Zod output (post-parse) — validated domain data.
export type CreateCustomerData = z.output<typeof CreateCustomerFormSchema>;
export type EditCustomerData = z.output<typeof EditCustomerFormSchema>;
