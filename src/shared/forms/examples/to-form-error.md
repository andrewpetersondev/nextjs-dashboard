# toFormError

```ts
export function toFormError<
  TField extends string,
  TPayload,
  TMessage extends string = string,
>(params: {
  readonly fieldErrors: DenseFieldErrorMap<TField, TMessage>;
  readonly failureMessage?: string;
  readonly fields?: readonly TField[];
  readonly raw?: Record<string, unknown>;
  readonly redactFields?: readonly TField[];
}): FormResult<TField, TPayload, string, TMessage> {
  const {
    fieldErrors,
    failureMessage = FORM_ERROR_MESSAGES.VALIDATION_FAILED,
    raw = {},
    fields = [] as const,
    redactFields = ["password" as TField],
  } = params;

  const values =
    fields.length > 0
      ? selectDisplayableStringFieldValues(raw, fields, redactFields)
      : undefined;

  return formError<TField, TPayload, string, TMessage>({
    fieldErrors,
    message: failureMessage,
    values,
  });
}
```

## Example 1: Basic validation error with field errors

```ts
const result = toFormError<"email" | "password", User>({
  fieldErrors: {
    email: ["Invalid email format"],
    password: ["Password too short"],
  },
});

// Output:
// {
//   ok: false,
//   error: {
//     code: 'VALIDATION',
//     kind: 'validation',
//     fieldErrors: {
//       email: ['Invalid email format'],
//       password: ['Password too short']
//     },
//     message: 'Validation failed',
//     values: undefined  // no fields specified, so no echo
//   }
// }
```

## Example 2: With raw values and fields (password redacted)

```ts
const result = toFormError<"email" | "password", User>({
  fieldErrors: {
    email: ["Email already exists"],
    password: [],
  },
  raw: {
    email: "test@example.com",
    password: "secret123",
  },
  fields: ["email", "password"],
});

// Output:
// {
//   ok: false,
//   error: {
//     code: 'VALIDATION',
//     kind: 'validation',
//     fieldErrors: {
//       email: ['Email already exists'],
//       password: []
//     },
//     message: 'Validation failed',
//     values: {
//       email: 'test@example.com',
//       password: '[REDACTED]'  // password redacted by default
//     }
//   }
// }
```

## Example 3: Custom failure message and custom redaction

```ts
const result = toFormError<"username" | "apiKey", UserSettings>({
  fieldErrors: {
    username: ["Username taken"],
    apiKey: ["Invalid format"],
  },
  failureMessage: "Unable to save settings",
  raw: {
    username: "john_doe",
    apiKey: "sk-1234567890",
  },
  fields: ["username", "apiKey"],
  redactFields: ["apiKey"],
});

// Output:
// {
//   ok: false,
//   error: {
//     code: 'VALIDATION',
//     kind: 'validation',
//     fieldErrors: {
//       username: ['Username taken'],
//       apiKey: ['Invalid format']
//     },
//     message: 'Unable to save settings',
//     values: {
//       username: 'john_doe',
//       apiKey: '[REDACTED]'  // apiKey redacted per redactFields
//     }
//   }
// }
```

## Example 4: Empty field errors (no validation issues)

```ts
const result = toFormError<"name" | "age", Profile>({
  fieldErrors: {
    name: [],
    age: [],
  },
  failureMessage: "Form submission failed",
});

// Output:
// {
//   ok: false,
//   error: {
//     code: 'VALIDATION',
//     kind: 'validation',
//     fieldErrors: {
//       name: [],
//       age: []
//     },
//     message: 'Form submission failed',
//     values: undefined  // no fields specified
//   }
// }
```

## Example 5: Multiple errors per field with custom message type

```ts
const result = toFormError<
  "email",
  LoginPayload,
  "EMAIL_INVALID" | "EMAIL_REQUIRED"
>({
  fieldErrors: {
    email: ["EMAIL_REQUIRED", "EMAIL_INVALID"],
  },
  failureMessage: "Login validation failed",
  raw: { email: "" },
  fields: ["email"],
  redactFields: [],
});

// Output:
// {
//   ok: false,
//   error: {
//     code: 'VALIDATION',
//     kind: 'validation',
//     fieldErrors: {
//       email: ['EMAIL_REQUIRED', 'EMAIL_INVALID']
//     },
//     message: 'Login validation failed',
//     values: {
//       email: ''  // empty string preserved, not redacted
//     }
//   }
// }
```
