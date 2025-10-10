# Data Handling Maps

## Dense (Full)

- Full form submission: every field is sent, including empty/default values.
- Use DenseFieldErrorMap for “all fields present” (empty array = no error).

## Sparse (Partial)

- Sparse submission: only filled/changed fields are sent; empty/untouched fields are omitted.
- Use SparseFieldErrorMap for “only errored fields present.”
- Helpers for conversion/merging while preserving immutability:
    - toDenseFromSparse(fields, sparse)
    - toSparseFromDense(dense)
    - set/merge functions

| Feature / Behavior | Dense (Full)                               | Sparse (Partial)                       |
|--------------------|--------------------------------------------|----------------------------------------|
| **Keys Sent**      | All form field names                       | Only filled/changed fields             |
| **Key Defaults**   | Included (empty string, null, empty array) | Omitted unless filled                  |
| **Value Types**    | string, null, empty string, empty array    | string, number, boolean, object, array |
| **Value Shapes**   | string, string[], string[][]               | string, string[], string[][], object   |

---

Perfect — here’s a **quick reference guide** showing what is valid and invalid for `NonEmptyArray<T>` with
strings and nullish values:

---

### 1. `NonEmptyArray<string>`

| Array           | Valid? | Reason                               |
|-----------------|--------|--------------------------------------|
| `["hello"]`     | ✅      | Non-empty, all elements are strings  |
| `["", "world"]` | ✅      | Empty strings are allowed            |
| `["", ""]`      | ✅      | Multiple empty strings still valid   |
| `[]`            | ❌      | Violates “at least one element” rule |

---

### 2. `NonEmptyArray<string | null>`

| Array             | Valid? | Reason                                    |
|-------------------|--------|-------------------------------------------|
| `["hello", null]` | ✅      | Non-empty, elements can be string or null |
| `[null, null]`    | ✅      | All null elements are allowed             |
| `[]`              | ❌      | Array must have at least one element      |

---

### 3. `NonEmptyArray<string | undefined>`

| Array                  | Valid? | Reason                                         |
|------------------------|--------|------------------------------------------------|
| `["hello", undefined]` | ✅      | Non-empty, elements can be string or undefined |
| `[undefined]`          | ✅      | Single undefined element is allowed            |
| `[]`                   | ❌      | Array must have at least one element           |

---

### 4. `NonEmptyArray<string | null | undefined>`

| Array                        | Valid? | Reason                                                |
|------------------------------|--------|-------------------------------------------------------|
| `["hello", null, undefined]` | ✅      | Non-empty, elements can be string, null, or undefined |
| `[null, undefined]`          | ✅      | Allowed, at least one element present                 |
| `[]`                         | ❌      | Violates “non-empty” constraint                       |

---

✅ **Key Takeaways:**

1. `NonEmptyArray<T>` guarantees **at least one element**.
2. Elements themselves **can be nullish** if the type allows it.
3. Empty array `[]` is **never valid**, regardless of `T`.
4. Empty strings `""` are **not nullish**, but they’re allowed as string elements.

---
