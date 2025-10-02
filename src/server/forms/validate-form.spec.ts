import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { validateFormGeneric } from "./validate-form";

vi.mock("@/server/logging/serverLogger", () => ({
  serverLogger: { error: vi.fn() },
}));

const { serverLogger } = require("@/server/logging/serverLogger");

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) {
    fd.append(k, v);
  }
  return fd;
}

describe("validateFormGeneric", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok: true on valid input", async () => {
    const schema = z.object({
      email: z.string().email(),
    });
    const formData = makeFormData({ email: "user@example.com" });

    const state = await validateFormGeneric(formData, schema, ["email"]);

    expect(state.ok).toBe(true);
    // Optional: expect(state.data?.email).toBe("user@example.com");
  });

  it("maps Zod validation errors to field error map", async () => {
    const schema = z.object({
      email: z.string().email(),
    });
    const formData = makeFormData({ email: "not-an-email" });

    const state = await validateFormGeneric(formData, schema, ["email"]);

    expect(state.ok).toBe(false);
    // Adjust property name if different (e.g. state.fieldErrors)
    const errs = (state as any).errors ?? (state as any).fieldErrors;
    expect(errs).toBeDefined();
    expect(Object.keys(errs)).toContain("email");
    expect(serverLogger.error).toHaveBeenCalledTimes(1);
  });

  it("handles unknown non-Zod error path producing empty dense map", async () => {
    const real = z.object({ email: z.string() });
    // Monkey patch safeParseAsync to simulate non-Zod shaped failure
    (real as any).safeParseAsync = async () => ({
      success: false,
      error: { random: "boom" }, // Not ZodError shape
    });

    const formData = makeFormData({ email: "value" });
    const state = await validateFormGeneric(formData, real, ["email"]);

    expect(state.ok).toBe(false);
    const errs = (state as any).errors ?? (state as any).fieldErrors;
    expect(Object.keys(errs)).toContain("email"); // dense map still has key
    expect(serverLogger.error).toHaveBeenCalledTimes(1);
  });
});
