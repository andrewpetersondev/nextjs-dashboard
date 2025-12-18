import { describe, expect, it } from "vitest";
import { toPgError } from "@/shared/errors/adapters/postgres/to-pg-error";

describe("toPgError", () => {
  it("maps a known Postgres code to appCode + condition + pg metadata", () => {
    const pgErr = {
      code: "23505",
      constraint: "users_email_key",
      table: "users",
    };

    const mapping = toPgError(pgErr);

    expect(mapping).toBeDefined();
    expect(mapping?.appCode).toBe("conflict");
    expect(mapping?.condition).toBe("pg_unique_violation");
    expect(mapping?.metadata.pgCode).toBe("23505");
    expect(mapping?.metadata.constraint).toBe("users_email_key");
    expect(mapping?.metadata.table).toBe("users");
  });

  it("finds pg error metadata through a cause chain", () => {
    const wrapped = {
      cause: {
        code: "23502",
        column: "email",
        table: "users",
      },
    };

    const mapping = toPgError(wrapped);

    expect(mapping).toBeDefined();
    expect(mapping?.condition).toBe("pg_not_null_violation");
    expect(mapping?.metadata.pgCode).toBe("23502");
    expect(mapping?.metadata.column).toBe("email");
  });

  it("returns undefined for non-postgres errors", () => {
    expect(toPgError(new Error("nope"))).toBeUndefined();
    expect(toPgError({ code: "not-a-pg-code" })).toBeUndefined();
    expect(toPgError(null)).toBeUndefined();
  });
});
