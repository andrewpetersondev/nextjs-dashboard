import { describe, expect, it } from "vitest";
import { normalizePgError } from "@/shared/errors/adapters/postgres/normalize-pg-error";

describe("normalizePgError", () => {
  it("uses pg condition as AppError.message and preserves pgCode", () => {
    const pgErr = { code: "23505", table: "users" };

    const appErr = normalizePgError(pgErr, {
      entity: "user",
      operation: "insertUser",
    });

    expect(appErr.code).toBe("conflict");
    expect(appErr.message).toBe("pg_unique_violation");

    // metadata is always present; pg fields should exist
    expect(appErr.metadata).toBeDefined();
    expect(appErr.metadata.pgCode).toBe("23505");
    expect(appErr.metadata.table).toBe("users");
    expect(appErr.metadata.operation).toBe("insertUser");
    expect(appErr.metadata.entity).toBe("user");
  });

  it("falls back to a database error when mapping fails", () => {
    const notPg = { message: "not pg" };

    const appErr = normalizePgError(notPg, { operation: "queryX" });

    expect(appErr.code).toBe("database");
    expect(appErr.message).toBe("pg_unknown_error");
    expect(appErr.metadata.operation).toBe("queryX");
  });
});
