# z.Infer vs z.Output vs z.Input

Summary

- z.infer: The schema’s output type after parsing/transformations. Equivalent to z.output.
- z.output: Synonym for z.infer; the validated/transformed result type.
- z.input: The schema’s input type before parsing/validation/transformations.

Notes

- With transforms (e.g., string -> number), input and output can differ.
- Use z.input to type incoming/raw data.
- Use z.infer/z.output to type parsed/validated results.
