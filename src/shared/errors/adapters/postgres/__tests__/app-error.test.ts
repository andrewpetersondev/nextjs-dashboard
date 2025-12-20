import { describe, expect, it } from "vitest";
import { AppError } from "@/shared/errors/core/app-error";

describe("AppError", () => {
  it("toJson always includes metadata", () => {
    const err = new AppError("unexpected", {
      cause: "",
      message: "x",
      metadata: {},
    });
    const json = err.toJson();

    expect(json.metadata).toEqual({});
    expect(json.code).toBe("unexpected");
    expect(json.message).toBe("x");
  });
});
