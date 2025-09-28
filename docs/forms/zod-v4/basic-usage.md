# Zod Basic Usage

[Webpage](https://zod.dev/basics)

## Parsing Data

### `.parse()`

### `.parseAsync()`

- use if schema uses certain async APIs like `refinements` or `transforms`

## Handling Errors

### `.parse()`

- must use a `try-catch` block

### `.safeParse()`

- To avoid a try/catch block, you can use the .safeParse() method to get back a plain result object containing either
  the successfully parsed data or a ZodError. The result type is a discriminated union, so you can handle both cases
  conveniently.

```ts

const result = Player.safeParse({username: 42, xp: "100"});
if (!result.success) {
    result.error;   // ZodError instance
} else {
    result.data;    // { username: string; xp: number }
}
```  

### `.safeParseAsync()`

Note — If your schema uses certain asynchronous APIs like async refinements or transforms, you'll need to use the
.safeParseAsync() method instead.

## Inferring Types

Types of input & output diverge if `.transform()` is used

### `.infer()` = `.output()`

### `.input()`


