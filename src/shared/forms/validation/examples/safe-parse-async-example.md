# Safe Parse Async Example

```ts
import {
    flattenZodError,
    treeifyZodError,
    untouchedZodError
} from "../../../../../code/my-github/nextjs-dashboard/src/shared/forms/errors/zod-error.helpers";
import {SignupSchema} from "../../../../../code/my-github/nextjs-dashboard/src/features/auth/lib/auth.schema";

// Create invalid data (username is valid, email is invalid, password is invalid)
const invalidUser = {
    username: "andrew",
    email: "invalid-email",
    password: "123",
    // asdf: "this key will cause a form error when using flatten something similar when using treeify"
};

console.log("trying safe parse async");

// Properly await safeParseAsync and handle result discriminant
(async () => {
    const result = await SignupSchema.safeParseAsync(invalidUser);

    if (result.success) {
        console.log("fulfilled branch");
        console.log("Result:", result);
        return;
    }

    console.log("rejected branch");

    const error = result.error;

    // flattened zod error instance
    console.log("Flattened ZodError instance:");
    const flattened = flattenZodError(error);
    console.log(flattened);

    // treeified zod error instance
    console.log("Treeified ZodError instance:");
    const errorTree = treeifyZodError(error);
    console.log(errorTree);

    // untouched zod error instance
    console.log("Untouched ZodError instance:");
    const untouched = untouchedZodError(error);
    console.log(untouched);

})();

```

flattened error instance

```terminaloutput
/Users/ap/.nvm/versions/node/v24.9.0/bin/node --import file:/Users/ap/Applications/WebStorm.app/Contents/plugins/nodeJS/js/ts-file-loader/node_modules/tsx/dist/loader.cjs /Users/ap/Library/Application Support/JetBrains/WebStorm2025.2/scratches/scratch_5.ts

rejected branch

Flattened ZodError instance:
{
  formErrors: [],
  fieldErrors: {
    email: [ 'Email had some sort of error. Please try again.' ],
    password: [
      'Password must be at least 5 characters long.',
      'Password must contain at least one letter.',
      'Password must contain at least one special character.'
    ]
  }
}

Process finished with exit code 0



```

treeified error instance

```terminaloutput
/Users/ap/.nvm/versions/node/v24.9.0/bin/node --import file:/Users/ap/Applications/WebStorm.app/Contents/plugins/nodeJS/js/ts-file-loader/node_modules/tsx/dist/loader.cjs /Users/ap/Library/Application Support/JetBrains/WebStorm2025.2/scratches/scratch_5.ts

rejected branch

Treeified ZodError instance:
{
  errors: [],
  properties: { email: { errors: [Array] }, password: { errors: [Array] } }
}

Process finished with exit code 0


```

untouched error instance

```terminaloutput
/Users/ap/.nvm/versions/node/v24.9.0/bin/node --import file:/Users/ap/Applications/WebStorm.app/Contents/plugins/nodeJS/js/ts-file-loader/node_modules/tsx/dist/loader.cjs /Users/ap/Library/Application Support/JetBrains/WebStorm2025.2/scratches/scratch_5.ts

rejected branch

Untouched ZodError instance:
ZodError: [
  {
    "origin": "string",
    "code": "invalid_format",
    "format": "email",
    "pattern": "/^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$/",
    "path": [
      "email"
    ],
    "message": "Email had some sort of error. Please try again."
  },
  {
    "origin": "string",
    "code": "too_small",
    "minimum": 5,
    "inclusive": true,
    "path": [
      "password"
    ],
    "message": "Password must be at least 5 characters long."
  },
  {
    "origin": "string",
    "code": "invalid_format",
    "format": "regex",
    "pattern": "/[a-zA-Z]/",
    "path": [
      "password"
    ],
    "message": "Password must contain at least one letter."
  },
  {
    "origin": "string",
    "code": "invalid_format",
    "format": "regex",
    "pattern": "/[!@#$%^&*(),.?\":{}|<>]/",
    "path": [
      "password"
    ],
    "message": "Password must contain at least one special character."
  }
]
    at new ZodError (/Users/ap/code/my-github/nextjs-dashboard/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/core/core.cjs:35:39)
    at Object.safeParseAsync (/Users/ap/code/my-github/nextjs-dashboard/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/core/parse.cjs:82:20)
    at inst.safeParseAsync (/Users/ap/code/my-github/nextjs-dashboard/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/schemas.cjs:147:57)
    at <anonymous> (/Users/ap/Library/Application Support/JetBrains/WebStorm2025.2/scratches/scratch_5.ts:20:43)
    at <anonymous> (/Users/ap/Library/Application Support/JetBrains/WebStorm2025.2/scratches/scratch_5.ts:45:5)
    at Object.<anonymous> (/Users/ap/Library/Application Support/JetBrains/WebStorm2025.2/scratches/scratch_5.ts:45:8)
    at Module._compile (node:internal/modules/cjs/loader:1760:14)
    at Object.transformer (/Users/ap/Applications/WebStorm.app/Contents/plugins/nodeJS/js/ts-file-loader/node_modules/tsx/dist/register-DfubRCxM.cjs:2:823)
    at Module.load (node:internal/modules/cjs/loader:1480:32)
    at Module._load (node:internal/modules/cjs/loader:1299:12)

Process finished with exit code 0


```
