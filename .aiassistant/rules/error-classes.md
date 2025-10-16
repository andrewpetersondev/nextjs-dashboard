---
apply: manually
patterns:
  - "src/**/errors/**"
  - "src/**/domain/**/errors/**"
exclude:
  - "src/ui/**"
---

Best practices for TypeScript classes:

1. Keep classes single‑purpose; favor composition over inheritance.
2. Make fields `readonly` where possible; avoid shared mutable state.
3. Keep constructors light; validate inputs and establish invariants early.
4. Prefer interfaces for contracts and use classes only when behavior/state is needed.
5. Use `protected`/`private` explicitly; mark overriding methods with `override`.
6. Add `toJSON()` when crossing process or RSC boundaries; only return JSON‑safe data.
7. Avoid static global state; inject dependencies via constructor.

Best practices for custom error classes:

1. Extend `Error`, set `name`, and fix the prototype via `Object.setPrototypeOf`.
2. Include a literal `code` for discrimination; model as a union or enum.
3. Accept and preserve `cause` using `ErrorOptions`; capture the stack once.
4. Freeze instances and make fields `readonly` to keep errors immutable.
5. Keep details JSON‑safe; redact or omit non‑serializable values.
6. Provide a `toJSON()` that emits only safe fields \(`code`, `name`, `message`, optionally `details`\).
7. Add type guards \(`isBaseError`\) for safe narrowing across layers.
8. Do not throw UI‑facing errors; adapt/internal → app/UI errors at boundaries.
9. Add stable operational metadata on the base type (e.g., `statusCode`, `severity`) when useful for logging/control flow.
10. Provide helpers to normalize unknown errors into your base type at boundaries (e.g., `from(value, fallbackCode)`), and to enrich without mutation (`withContext`).

Example: frozen, serializable BaseError with code and cause.

```typescript
export type BaseErrorCode =
  | "DB_CONFLICT"
  | "VALIDATION"
  | "NOT_FOUND"
  | "INTERNAL";

export interface BaseErrorInit<C extends BaseErrorCode = BaseErrorCode> {
  readonly code: C;
  readonly message: string;
  readonly cause?: unknown;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly statusCode?: number;
  readonly severity?: "info" | "warn" | "error";
}

export class BaseError<C extends BaseErrorCode = BaseErrorCode> extends Error {
  public readonly code: C;
  public readonly cause: unknown | undefined;
  public readonly details: Readonly<Record<string, unknown>> | undefined;
  public readonly statusCode: number | undefined;
  public readonly severity: "info" | "warn" | "error";

  constructor(init: BaseErrorInit<C>) {
    super(init.message);
    this.name = "BaseError";
    this.code = init.code;
    this.cause = init.cause;
    this.details = init.details;
    this.statusCode = init.statusCode;
    this.severity = init.severity ?? "error";

    Object.setPrototypeOf(this, BaseError.prototype);
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, BaseError);
    }
    Object.freeze(this);
  }

  // Emit only JSON‑safe fields; prefer using a project redaction helper for details.
  public toJSON(): {
    readonly name: string;
    readonly code: C;
    readonly message: string;
    readonly details?: Readonly<Record<string, unknown>>;
    readonly statusCode?: number;
    readonly severity: "info" | "warn" | "error";
  } {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      statusCode: this.statusCode,
      severity: this.severity,
    };
  }

  // Narrowing helper for unknown values.
  public static is(value: unknown): value is BaseError {
    return value instanceof BaseError;
  }

  // Normalize unknown to BaseError with a fallback code.
  public static from<C extends BaseErrorCode>(
    value: unknown,
    fallback: C,
    init?: Omit<BaseErrorInit<C>, "code" | "message"> & {
      readonly message?: string;
    },
  ): BaseError<C> {
    if (value instanceof BaseError) return value as BaseError<C>;
    const message =
      value &&
      typeof value === "object" &&
      "message" in value &&
      typeof (value as any).message === "string"
        ? (value as any).message
        : typeof value === "string"
          ? value
          : "Unknown error";
    return new BaseError<C>({
      code: fallback,
      message,
      cause: value,
      details: init?.details,
      statusCode: init?.statusCode,
      severity: init?.severity,
    });
  }
}
```

Example: lightweight, UI‑safe AppError value for rendering and transport.

```typescript
export type AppErrorKind = "conflict" | "validation" | "not_found" | "internal";
export type AppErrorSeverity = "error" | "warning" | "info";

export interface AppErrorInit {
  readonly code: string;
  readonly kind: AppErrorKind;
  readonly message: string;
  readonly severity?: AppErrorSeverity;
  readonly details?: Readonly<Record<string, unknown>>;
}

export class AppError {
  public readonly code: string;
  public readonly kind: AppErrorKind;
  public readonly message: string;
  public readonly severity: AppErrorSeverity;
  public readonly details: Readonly<Record<string, unknown>> | undefined;

  constructor(init: AppErrorInit) {
    this.code = init.code;
    this.kind = init.kind;
    this.message = init.message;
    this.severity = init.severity ?? "error";
    this.details = init.details;
    Object.freeze(this);
  }

  public toJSON(): {
    readonly code: string;
    readonly kind: AppErrorKind;
    readonly message: string;
    readonly severity: AppErrorSeverity;
    readonly details?: Readonly<Record<string, unknown>>;
  } {
    return {
      code: this.code,
      kind: this.kind,
      message: this.message,
      severity: this.severity,
      details: this.details,
    };
  }
}
```



Last updated: 2025-10-16
