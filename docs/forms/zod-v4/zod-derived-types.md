# z.Infer vs z.Output vs z.Input

Summary

- z.infer: The schema’s output type after parsing/transformations. Equivalent to z.output.
- z.output: Synonym for z.infer; the validated/transformed result type.
- z.input: The schema’s input type before parsing/validation/transformations.

Notes

- With transforms (e.g., string -> number), input and output can differ.
- Use z.input to type incoming/raw data.
- Use z.infer/z.output to type parsed/validated results.

---

z.input and z.output will not be equal when a schema transforms its input to a different type as output. For example, if you use .transform(), .default(), or other operations that change the type, the input and output types diverge.

Example with .transform():

```ts
const mySchema = z.string().transform((val) => val.length);

type MySchemaIn = z.input<typeof mySchema>; // string
type MySchemaOut = z.output<typeof mySchema>; // number
```
In this case, the input type is string, but the output type is number because the transform changes the value during parsing1, 2.

Other cases include using .default(), where the input might allow undefined but the output is the base type.

