# Use This Instead of That

z.email() instead of z.string().email()

## Coerce vs Transform vs Pipe vs Preprocess

**_HTML forms send form fields as strings._**

Here is a concise comparison of pipe, transform, and preprocess in Zod (v4):

### Coerce

- **z.coerce**: Provides built-in schemas that attempt to coerce the input to the desired type using JavaScript's
  conversion rules. For example, z.coerce.string() will turn numbers, booleans, null, etc., into strings

```ts
z.coerce.string();    // String(input)
z.coerce.number();    // Number(input)
z.coerce.boolean();   // Boolean(input)
z.coerce.bigint();    // BigInt(input)

z.coerce.string().parse(42); // => "42"
z.coerce.boolean().parse("false"); // => true (because any non-empty string is true in JS)
```

### Transform

- **.transform**: Defines a unidirectional transformation on a schema. It accepts any input and performs a
  transformation on the data, returning the result. You can validate inside a transform using the ctx parameter and
  report issues by pushing to ctx.issues. Transforms can also be async, but then you must use .parseAsync or
  .safeParseAsync to parse.

```ts
const castToString = z.transform((val) => String(val));
castToString.parse(123); // => "123"
```

### Pipe

- **.pipe**: Chains schemas together, typically used to first validate with one schema and then transform with another.
  The output type of the first schema must match the input type of the next. Commonly used with transforms for
  multi-step validation and transformation.

```ts
const stringToLength = z.string().pipe(z.transform(val => val.length));
stringToLength.parse("hello"); // => 5
```

### Preprocess

- **z.preprocess**: Convenience function for piping a transform into another schema. It takes a preprocessing function
  and a schema, and is equivalent to z.pipe(z.transform(fn), schema).

```ts
const coercedInt = z.preprocess((val) => {
    if (typeof val === "string") {
        return Number.parseInt(val);
    }
    return val;
}, z.int());
```
