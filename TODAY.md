# Tasks For Today

Here is a senior-level plan to extract and centralize Zod form validation for the `signup` function, ensuring maintainability, type safety, and testability.

---

## 1. **Goal**

- Extract Zod validation logic from `user.actions.ts` into a reusable, type-safe utility.
- Ensure all form actions (including `signup`) use this utility for validation.
- Provide clear input/output types for each function.
- Centralize error normalization and result formatting.

---

## 2. **Outline**

### **A. Create a Generic Form Validation Utility**

**File:** `src/lib/utils/form-validation.ts`

#### **Function: validateFormData**

- **Purpose:**  
  Generic function to validate `FormData` against a Zod schema and return a standardized result.

- **Inputs:**
  - `formData: FormData` — The raw form data from the request.
  - `schema: z.ZodSchema<T>` — The Zod schema for validation.
  - `fieldMap?: Record<string, string>` — Optional mapping from form field names to schema keys (for renaming or aliasing).

- **Outputs:**
  - `ValidationResult<T>` —
    ```typescript
    type ValidationResult<T> = {
      success: boolean;
      data?: T;
      errors: Record<string, string[]>;
      message: string;
    };
    ```

- **Steps:**
  1. Convert `FormData` to a plain object, applying `fieldMap` if provided.
  2. Validate using `schema.safeParse`.
  3. If invalid, normalize errors and return a failure result.
  4. If valid, return the parsed data and a success result.

---

### **B. Update Domain-Specific Validation Functions**

**File:** `src/features/users/user.service.ts`

#### **Function: validateSignupForm**

- **Purpose:**  
  Use the generic utility to validate signup form data.

- **Inputs:**
  - `formData: FormData`

- **Outputs:**
  - `FormState<SignupFormFieldNames, SignupFormFields>`

- **Steps:**
  1. Call `validateFormData(formData, SignupFormSchema)`.
  2. Map the result to `FormState` shape.
  3. Return the result.

---

### **C. Refactor Action Functions**

**File:** `src/features/users/user.actions.ts`

- Replace inline Zod validation in `signup` with a call to `validateSignupForm`.

---

### **D. Types**

- **ValidationResult<T>**:  
  Standardized result for all form validations.
- **FormState<TFieldNames, TData>**:  
  Already defined, used for UI state.

---

### **E. Error Normalization**

- Use or extend `normalizeFieldErrors` utility for consistent error shapes.

---

## 3. **Summary Table**

| Function           | Input Types                       | Output Types                                      | File Location                      |
| ------------------ | --------------------------------- | ------------------------------------------------- | ---------------------------------- |
| validateFormData   | FormData, ZodSchema<T>, fieldMap? | ValidationResult<T>                               | src/lib/utils/form-validation.ts   |
| validateSignupForm | FormData                          | FormState<SignupFormFieldNames, SignupFormFields> | src/features/users/user.service.ts |
| signup (action)    | FormState, FormData               | FormState<SignupFormFieldNames, SignupFormFields> | src/features/users/user.actions.ts |

---

## 4. **Benefits**

- **DRY:** Centralizes validation logic.
- **Type-Safe:** Ensures correct types throughout.
- **Testable:** Utility can be unit tested in isolation.
- **Maintainable:** Easy to add new forms or update validation.

---

## 5. **Next Steps**

1. Implement `validateFormData` utility.
2. Refactor `validateSignupForm` to use the utility.
3. Update `signup` action to use `validateSignupForm`.
4. Add/extend tests for the new utility.

---

This plan ensures robust, maintainable, and production-ready form validation across your Next.js app.
