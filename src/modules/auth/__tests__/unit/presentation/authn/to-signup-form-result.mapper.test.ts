import { describe, expect, it } from "vitest";
import { toSignupFormResult } from "@/modules/auth/presentation/authn/mappers/to-signup-form-result.mapper";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { PG_CODES } from "@/shared/core/errors/server/adapters/postgres/pg-error.constants";

/**
 * Unit tests for toSignupFormResult.
 *
 * Security boundary: this mapper builds the client-visible FormResult for
 * failed signups, and `AppError.toDto()` serializes metadata verbatim (and
 * drops `cause`). Two sibling leaks are pinned here:
 *
 * - Only `SIGNUP_ECHO_FIELDS_LIST` values may appear in `metadata.formData`;
 *   the submitted password must never cross the Server Action boundary
 *   (BACKLOG: "Stop echoing sensitive fields").
 * - Raw Postgres metadata — `detail` (which embeds the duplicate value),
 *   `table`, `schema`, `constraint`, `severity`, `where` — stays server-side
 *   on the cause chain; conflict metadata carries only form-relevant fields
 *   plus the bare pg code.
 */
describe("toSignupFormResult", () => {
	const submitted = {
		email: "user@example.com",
		password: "hunter2-secret",
		username: "andrew",
	} as const;

	const PG_DETAIL = "Key (email)=(user@example.com) already exists.";

	/** Conflict error as `normalizePgError` produces it: raw pg metadata. */
	const rawPgConflictError = (constraint: string): AppError =>
		makeAppError(APP_ERROR_KEYS.conflict, {
			cause: "pg unique violation",
			message: "pg_unique_violation",
			metadata: {
				constraint,
				detail: PG_DETAIL,
				pgCode: PG_CODES.UNIQUE_VIOLATION,
				schema: "public",
				severity: "ERROR",
				table: "users",
				where: "SQL statement",
			},
		});

	it("maps a unique violation to conflict field errors without echoing the password", () => {
		const error = makeAppError(APP_ERROR_KEYS.conflict, {
			cause: "",
			message: "duplicate key",
			metadata: {
				constraint: "users_email_unique",
				pgCode: PG_CODES.UNIQUE_VIOLATION,
			},
		});

		const result = toSignupFormResult(error, submitted);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.key).toBe(APP_ERROR_KEYS.conflict);
			expect(result.error.metadata).toEqual(
				expect.objectContaining({
					fieldErrors: expect.objectContaining({
						email: ["alreadyInUse"],
					}),
					formData: { email: "user@example.com", username: "andrew" },
				}),
			);

			// JSON serialization safety: the DTO crossing the boundary carries
			// no trace of the password.
			expect(JSON.stringify(result)).not.toContain("hunter2-secret");
		}
	});

	it("redacts the echo on the generic error path too", () => {
		const error = makeAppError(APP_ERROR_KEYS.unexpected, {
			cause: "",
			message: "Something broke.",
			metadata: {},
		});

		const result = toSignupFormResult(error, submitted);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.metadata).toEqual(
				expect.objectContaining({
					formData: { email: "user@example.com", username: "andrew" },
				}),
			);
			expect(JSON.stringify(result)).not.toContain("hunter2-secret");
		}
	});

	describe("unique-violation field routing", () => {
		it("flags username for a username-constraint conflict", () => {
			const result = toSignupFormResult(
				rawPgConflictError("users_username_unique"),
				submitted,
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.metadata).toEqual(
					expect.objectContaining({
						fieldErrors: {
							email: [],
							password: [],
							username: ["alreadyInUse"],
						},
					}),
				);
			}
		});

		it("flags both email and username when the constraint matches neither", () => {
			const result = toSignupFormResult(
				rawPgConflictError("users_pkey"),
				submitted,
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.metadata).toEqual(
					expect.objectContaining({
						fieldErrors: {
							email: ["alreadyInUse"],
							password: [],
							username: ["alreadyInUse"],
						},
					}),
				);
			}
		});

		it("finds the constraint on the cause chain (infra-mapped conflict shape)", () => {
			const integrity = makeAppError(APP_ERROR_KEYS.integrity, {
				cause: "pg unique violation",
				message: "pg_unique_violation",
				metadata: {
					constraint: "users_email_unique",
					detail: PG_DETAIL,
					pgCode: PG_CODES.UNIQUE_VIOLATION,
					table: "users",
				},
			});
			const conflict = makeAppError(APP_ERROR_KEYS.conflict, {
				cause: integrity,
				message: "Signup failed: value already in use",
				metadata: { pgCode: PG_CODES.UNIQUE_VIOLATION },
			});

			const result = toSignupFormResult(conflict, submitted);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.metadata).toEqual(
					expect.objectContaining({
						fieldErrors: {
							email: ["alreadyInUse"],
							password: [],
							username: [],
						},
					}),
				);
			}
		});
	});

	describe("pg metadata must not cross the Server Action boundary", () => {
		it("builds the conflict metadata only from form-relevant fields", () => {
			const result = toSignupFormResult(
				rawPgConflictError("users_email_unique"),
				submitted,
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				// Exact metadata shape: any extra key (e.g. a forwarded pg field)
				// fails this assertion.
				expect(result.error.metadata).toEqual({
					fieldErrors: {
						email: ["alreadyInUse"],
						password: [],
						username: [],
					},
					formData: { email: "user@example.com", username: "andrew" },
					formErrors: [],
					pgCode: PG_CODES.UNIQUE_VIOLATION,
				});
			}
		});

		it("forwards none of the raw pg fields", () => {
			const result = toSignupFormResult(
				rawPgConflictError("users_email_unique"),
				submitted,
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				for (const pgField of [
					"column",
					"constraint",
					"datatype",
					"detail",
					"hint",
					"position",
					"schema",
					"severity",
					"table",
					"where",
				]) {
					expect(result.error.metadata).not.toHaveProperty(pgField);
				}

				// Nothing pg-shaped survives anywhere in the serialized DTO.
				const serialized = JSON.stringify(result.error);
				expect(serialized).not.toContain(PG_DETAIL);
				expect(serialized).not.toContain("already exists.");
				expect(serialized).not.toContain("users_email_unique");
				expect(serialized).not.toContain('"table"');
				expect(serialized).not.toContain('"schema"');

				// The server error is kept as cause on the entity, and toDto
				// drops cause — so it must not appear on the DTO either.
				expect(result.error).not.toHaveProperty("cause");
			}
		});
	});
});
