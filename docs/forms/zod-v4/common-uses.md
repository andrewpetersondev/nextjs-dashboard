# Common Uses

## Enums

```ts
const fish = ["Salmon", "Tuna", "Trout"] as const;

const FishEnum = z.enum(fish);
type FishEnum = z.infer<typeof FishEnum>; // "Salmon" | "Tuna" | "Trout"
```

Possibly implement the following

```ts
const FishEnum = z.enum(["Salmon", "Tuna", "Trout"]);

FishEnum.enum;
// => { Salmon: "Salmon", Tuna: "Tuna", Trout: "Trout" }
```

## Objects (.object(), .strictObject(), )

- I use `.object()` a lot. (consider making stricter)
- `z.strictObject()` throws an error when unknown keys are present
- 
