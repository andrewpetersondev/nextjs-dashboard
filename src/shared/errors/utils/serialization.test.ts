import { describe, expect, it } from "vitest";
import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { AppError } from "@/shared/errors/core/app-error.entity";
import type { AppErrorParams } from "@/shared/errors/core/app-error.params";
import { redactNonSerializable } from "@/shared/errors/utils/serialization";

const TEST_ERROR_CODE: AppErrorKey = APP_ERROR_KEYS.unexpected;

function makeTestAppError(options: AppErrorParams): AppError {
  return new AppError(TEST_ERROR_CODE, options);
}

describe("redactNonSerializable", () => {
  it("returns Error instances with only name and message fields", () => {
    const input = new Error("boom");
    const redacted = redactNonSerializable(input) as {
      message: string;
      name: string;
    };
    expect(redacted).toEqual({
      message: "boom",
      name: "Error",
    });
  });

  it("returns JSON-serializable primitives and objects as-is", () => {
    const primitive = 42;
    const obj = { foo: "bar", nested: { value: 1 } };

    expect(redactNonSerializable(primitive)).toBe(primitive);
    expect(redactNonSerializable(obj)).toBe(obj);
  });

  it("handles BigInt values by treating them as serializable", () => {
    const value = BigInt(123);

    const result = redactNonSerializable(value);

    expect(result).toBe(value);
  });

  it("redacts circular objects with diagnostic metadata", () => {
    const circular: { self?: unknown; value: string } = { value: "x" };
    circular.self = circular;

    const redacted = redactNonSerializable(circular) as {
      note: string;
      originalType: string;
      preview: string;
    };

    expect(redacted.note).toBe("non-serializable");
    expect(redacted.originalType).toBe("object");
    expect(typeof redacted.preview).toBe("string");
    expect(redacted.preview.length).toBeGreaterThan(0);
  });

  it("redacts non-serializable values with a bounded preview", () => {
    const large = { text: "x".repeat(10_000) };

    const redacted = redactNonSerializable(large) as {
      note: string;
      originalType: string;
      preview: string;
    };
    expect(redacted.note).toBe("non-serializable");
    expect(redacted.originalType).toBe("object");
    expect(redacted.preview.length).toBeLessThanOrEqual(600);
    expect(redacted.preview).toContain("…[truncated ");
  });
});

describe("AppError metadata sanitization (integration with redactNonSerializable)", () => {
  it("keeps serializable metadata values unchanged", () => {
    const metadata = {
      count: 1,
      foo: "bar",
      nested: { ok: true },
    } as const;

    const error = makeTestAppError({
      cause: undefined,
      message: "test",
      metadata: { ...metadata },
    });

    expect(error.metadata.foo).toBe("bar");
    expect(error.metadata.count).toBe(1);
    expect(error.metadata.nested).toEqual({ ok: true });
  });

  it("redacts non-serializable metadata values", () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;

    const error = makeTestAppError({
      cause: undefined,
      message: "test",
      metadata: { circular },
    });

    const value = error.metadata.circular as {
      note: string;
      originalType: string;
      preview: string;
    };

    expect(value.note).toBe("non-serializable");
    expect(value.originalType).toBe("object");
    expect(typeof value.preview).toBe("string");
  });

  it("keeps Error instances in metadata redacted to name and message", () => {
    const inner = new Error("inner boom");

    const error = makeTestAppError({
      cause: undefined,
      message: "test",
      metadata: { inner },
    });

    const value = error.metadata.inner as {
      message: string;
      name: string;
    };

    expect(value).toEqual({
      message: "inner boom",
      name: "Error",
    });
  });
});
