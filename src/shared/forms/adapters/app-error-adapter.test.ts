import { describe, expect, it } from "vitest";
import type { AppError } from "@/shared/core/result/app-error";
import { appErrorToFormResult } from "@/shared/forms/adapters/app-error-to-form.adapters";

type Field = "email" | "password" | "confirmPassword" | "username";

const fields: readonly Field[] = Object.freeze([
  "email",
  "password",
  "confirmPassword",
  "username",
]);

const RAW: Readonly<Record<string, unknown>> = Object.freeze({
  confirmPassword: "Secret#1",
  email: "taken@example.com",
  password: "Secret#1",
  username: "john",
});

function makeError(
  code: AppError["code"],
  message: string,
  details?: unknown,
): AppError {
  return Object.freeze({
    code,
    message,
    ...(details ? { details } : {}),
  });
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <its a test>
describe("appErrorToFormResult", () => {
  it("maps CONFLICT with email details to fieldErrors.email and redacts passwords", () => {
    const err = makeError("CONFLICT", "Conflict", {
      column: "email",
      constraint: "users_email_key",
      fields: ["email"],
    });

    const result = appErrorToFormResult<Field, unknown>({
      error: err,
      fields,
      raw: RAW,
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    // Dense map present for all fields
    expect(result.error.fieldErrors.email).toEqual(["Email already in use"]);
    expect(result.error.fieldErrors.username).toEqual([]);
    expect(result.error.fieldErrors.password).toEqual([]);
    expect(result.error.fieldErrors.confirmPassword).toEqual([]);

    // Message defaults to conflict message
    expect(result.error.message).toBe("Email already in use");

    // Values echo excludes/redacts password fields
    expect(result.error.values?.email).toBe("taken@example.com");
    expect(result.error.values?.username).toBe("john");
    expect(result.error.values?.password).toBeUndefined();
    expect(result.error.values?.confirmPassword).toBeUndefined();
  });

  it("falls back to generic validation failure with dense empty arrays when not conflict", () => {
    const err = makeError("DATABASE", "DB failed");

    const result = appErrorToFormResult<Field, unknown>({
      defaultMessage: "Request failed. Please try again.",
      error: err,
      fields,
      raw: RAW,
      // also verify explicit redact override still works
      redactFields: Object.freeze<Field[]>(["password", "confirmPassword"]),
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    // All empty
    expect(result.error.fieldErrors.email).toEqual([]);
    expect(result.error.fieldErrors.username).toEqual([]);
    expect(result.error.fieldErrors.password).toEqual([]);
    expect(result.error.fieldErrors.confirmPassword).toEqual([]);

    // Message falls back to default or error.message
    expect(result.error.message).toBe("Request failed. Please try again.");

    // Values echo includes only non-redacted fields
    expect(result.error.values?.email).toBe("taken@example.com");
    expect(result.error.values?.username).toBe("john");
    expect(result.error.values?.password).toBeUndefined();
  });

  it("uses provided conflictEmailField when inferring from details is not possible", () => {
    const err = makeError("CONFLICT", "Conflict");

    const result = appErrorToFormResult<Field, unknown>({
      conflictEmailField: "email",
      conflictMessage: "Email already in use",
      error: err,
      fields,
      raw: RAW,
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    expect(result.error.fieldErrors.email).toEqual(["Email already in use"]);
    expect(result.error.message).toBe("Email already in use");
  });

  it("honors custom redactFields option", () => {
    const err = makeError("CONFLICT", "Conflict", { column: "email" });

    const result = appErrorToFormResult<Field, unknown>({
      error: err,
      fields,
      raw: RAW,
      redactFields: Object.freeze<Field[]>(["password"]), // allow confirmPassword to pass through
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    expect(result.error.values?.email).toBe("taken@example.com");
    expect(result.error.values?.username).toBe("john");
    expect(result.error.values?.password).toBeUndefined();
    expect(result.error.values?.confirmPassword).toBe("Secret#1");
  });
});
