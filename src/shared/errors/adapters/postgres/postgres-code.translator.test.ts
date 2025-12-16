import { describe, expect, it } from "vitest";
import { mapPgError } from "@/shared/errors/adapters/postgres/postgres-code.translator";

describe("mapPgError", () => {
  it("maps a known Postgres code to appCode + condition + pg metadata", () => {
    const pgErr = {
      code: "23505",
      constraint: "users_email_key",
      table: "users",
    };

    const mapping = mapPgError(pgErr);

    expect(mapping).toBeDefined();
    expect(mapping?.appCode).toBe("conflict");
    expect(mapping?.condition).toBe("db_unique_violation");
    expect(mapping?.pgMetadata.pgCode).toBe("23505");
    expect(mapping?.pgMetadata.constraint).toBe("users_email_key");
    expect(mapping?.pgMetadata.table).toBe("users");
  });

  it("finds pg error metadata through a cause chain", () => {
    const wrapped = {
      cause: {
        code: "23502",
        column: "email",
        table: "users",
      },
    };

    const mapping = mapPgError(wrapped);

    expect(mapping).toBeDefined();
    expect(mapping?.condition).toBe("db_not_null_violation");
    expect(mapping?.pgMetadata.pgCode).toBe("23502");
    expect(mapping?.pgMetadata.column).toBe("email");
  });

  it("returns undefined for non-postgres errors", () => {
    expect(mapPgError(new Error("nope"))).toBeUndefined();
    expect(mapPgError({ code: "not-a-pg-code" })).toBeUndefined();
    expect(mapPgError(null)).toBeUndefined();
  });
});
