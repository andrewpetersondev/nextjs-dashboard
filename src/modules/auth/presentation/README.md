# Auth Presentation Layer

This layer contains the **user interface and API endpoints** for authentication and session management. It handles user
interactions, form submissions, and renders UI components using Next.js Server Actions and React components.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture Principles](#architecture-principles)
- [Directory Structure](#directory-structure)
- [Server Actions](#server-actions)
- [React Components](#react-components)
- [Form Handling](#form-handling)
- [Error Display](#error-display)
- [Testing Strategy](#testing-strategy)

---

## Overview

The presentation layer is the **entry point** for user interactions. It:

- **Handles HTTP requests**: Server Actions process form submissions
- **Validates input**: Uses Zod schemas before calling application layer
- **Renders UI**: React components display forms, errors, and feedback
- **Maps errors**: Converts application errors to user-friendly messages
- **Manages navigation**: Redirects after successful operations

**Key Principle**: Presentation depends on application workflows, but never directly on infrastructure or domain.

---

## Architecture Principles

### 1. **Server Actions Pattern**

Next.js Server Actions handle form submissions server-side:

```typescript
"use server";

export async function loginAction(
  _prevState: FormResult<unknown>,
  formData: FormData,
): Promise<FormResult<never>> {
  // 1. Validate input
  const validated = await validateForm(formData, LoginRequestSchema, fields);
  if (!validated.ok) return validated;

  // 2. Call application workflow
  const auth = await makeAuthComposition();
  const result = await auth.workflows.login(validated.value.data);

  // 3. Handle result
  if (!result.ok) return toLoginFormResult(result.error, input);

  // 4. Redirect on success
  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
```

### 2. **Progressive Enhancement**

Forms work without JavaScript, enhanced with client-side validation:

```typescript
// Server-side validation (always runs)
const validated = await validateForm(formData, LoginRequestSchema, fields);

// Client-side validation (optional, for better UX)
<form action={loginAction}>
  <input type="email" name="email" required />
</form>
```

### 3. **Separation of Concerns**

- **Actions**: Business logic orchestration (call workflows)
- **Components**: UI rendering (forms, cards, feedback)
- **Mappers**: Error transformation (AppError → FormResult)
- **Transports**: Type definitions (props, form state)

### 4. **Type Safety**

All form fields and errors are strongly typed:

```typescript
export type LoginField = "email" | "password";

export type LoginFormResult = FormResult<LoginField>;
```

---

## Directory Structure

```
presentation/
├── authn/                          # Authentication UI
│   ├── actions/                    # Server Actions
│   │   ├── demo-user.action.ts     # Create demo user
│   │   ├── login.action.ts         # User login
│   │   ├── logout.action.ts        # User logout
│   │   └── signup.action.ts        # User registration
│   ├── components/                 # React components
│   │   ├── cards/                  # Page-level components
│   │   │   ├── login-card.tsx
│   │   │   └── signup-card.tsx
│   │   ├── forms/                  # Form components
│   │   │   ├── demo-form.tsx
│   │   │   ├── login-form.tsx
│   │   │   ├── logout-form.tsx
│   │   │   └── signup-form.tsx
│   │   └── shared/                 # Reusable UI components
│   │       ├── auth-actions-row.tsx
│   │       ├── auth-form-demo-section.tsx
│   │       ├── auth-form-feedback.tsx
│   │       ├── auth-form-social-section.tsx
│   │       ├── auth-page-wrapper.tsx
│   │       ├── forgot-password-link.tsx
│   │       ├── form-row.wrapper.tsx
│   │       ├── icons.tsx
│   │       ├── remember-me-checkbox.tsx
│   │       └── social-login-button.tsx
│   ├── mappers/                    # Error mappers
│   │   └── auth-form-error.mapper.ts
│   └── transports/                 # Type definitions
│       ├── auth-action-props.transport.ts
│       ├── login.transport.ts
│       └── signup.transport.ts
│
├── session/                        # Session UI
│   ├── actions/
│   │   └── verify-session-optimistic.action.ts
│   ├── components/                 # (Empty - future session UI)
│   └── features/
│       └── session-refresh.tsx
│
└── constants/                      # UI constants
    ├── auth-ui.constants.ts
    └── auth.tokens.ts
```

---

## Server Actions

### **What are Server Actions?**

Server Actions are Next.js functions that run on the server and can be called directly from forms or client components.

**Benefits:**

- No API routes needed
- Type-safe by default
- Progressive enhancement
- Built-in form handling

### **Action Pattern**

All auth actions follow this pattern:

```typescript
"use server";

export async function myAction(
  _prevState: FormResult<unknown>,
  formData: FormData,
): Promise<FormResult<never>> {
  // 1. Setup: Get composition root and logger
  const auth = await makeAuthComposition();
  const logger = auth.loggers.action;
  const tracker = new PerformanceTracker();

  // 2. Validate: Check input against schema
  const validated = await validateForm(formData, MySchema, fields);
  if (!validated.ok) return validated;

  // 3. Execute: Call application workflow
  const result = await auth.workflows.myWorkflow(validated.value.data);

  // 4. Handle errors: Map to form result
  if (!result.ok) return toMyFormResult(result.error, input);

  // 5. Success: Revalidate and redirect
  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
```

### **Available Actions**

#### **loginAction** (`actions/login.action.ts`)

Authenticates user and establishes session.

**Input:** Email, password  
**Success:** Redirect to dashboard  
**Errors:** Invalid credentials, validation errors

#### **signupAction** (`actions/signup.action.ts`)

Registers new user and establishes session.

**Input:** Email, username, password  
**Success:** Redirect to dashboard  
**Errors:** Duplicate email/username, validation errors

#### **demoUserAction** & **demoAdminAction** (`actions/demo-user.action.ts`)

Creates temporary demo user for testing with the corresponding role.

**Input:** None (Role is determined by the action)  
**Success:** Redirect to dashboard  
**Errors:** Demo user creation failed

#### **logoutAction** (`actions/logout.action.ts`)

Terminates current session.

**Input:** None  
**Success:** Redirect to login  
**Errors:** Session termination failed

---

## React Components

### **Component Hierarchy**

```
Page (app/login/page.tsx)
  └─ LoginCard (presentation/authn/components/cards/)
      └─ LoginForm (presentation/authn/components/forms/)
          ├─ AuthFormFeedback (shared/)
          ├─ FormRowWrapper (shared/)
          ├─ RememberMeCheckbox (shared/)
          ├─ AuthActionsRow (shared/)
          └─ AuthFormDemoSection (shared/)
```

### **Component Types**

#### **Cards** (`components/cards/`)

Page-level containers that wrap forms:

```typescript
export function LoginCard() {
    return (
        <AuthPageWrapper title = "Sign In" >
            <LoginForm / >
            </AuthPageWrapper>
    );
}
```

#### **Forms** (`components/forms/`)

Form components that use Server Actions:

```typescript
export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction}>
      <AuthFormFeedback state={state} />
      <input type="email" name="email" />
      <input type="password" name="password" />
      <button type="submit" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
```

#### **Shared Components** (`components/shared/`)

Reusable UI elements:

- **Layout**: `AuthPageWrapper`, `FormRowWrapper`
- **Feedback**: `AuthFormFeedback` (displays errors)
- **Controls**: `RememberMeCheckbox`
- **Sections**: `AuthFormDemoSection`, `AuthFormSocialSection`
- **Links**: `ForgotPasswordLink`
- **Buttons**: `SocialLoginButton`
- **Icons**: `Icons` (auth-related icons)

---

## Form Handling

### **Form State Management**

Using Next.js `useActionState` hook:

```typescript
const [state, formAction, isPending] = useActionState(loginAction, {
  ok: true,
  value: { data: null },
});
```

**State properties:**

- `state.ok`: Boolean indicating success/failure
- `state.error`: Error details (if `ok` is false)
- `isPending`: Boolean indicating form submission in progress

### **Input Validation**

Two-stage validation:

1. **Client-side** (optional, for UX):

```typescript
<input
  type="email"
  name="email"
  required
  pattern="[^@]+@[^@]+\.[^@]+"
/>
```

2. **Server-side** (always runs):

```typescript
const validated = await validateForm(formData, LoginRequestSchema, fields);
```

### **Error Display**

Errors are displayed using `AuthFormFeedback`:

```typescript
<AuthFormFeedback state={state} />
```

**Error types:**

- **Field errors**: Displayed next to specific fields
- **Form errors**: Displayed at top of form
- **Generic errors**: Fallback for unexpected errors

---

## Error Display

### **Error Mapping Flow**

```
AppError (application layer)
  ↓ toLoginFormResult()
FormResult<LoginField> (presentation layer)
  ↓ AuthFormFeedback component
User-friendly error message (UI)
```

### **Error Mapper** (`mappers/auth-form-error.mapper.ts`)

Converts application errors to form errors:

```typescript
export function toLoginFormResult(
  error: AppError,
  input: LoginRequestDto,
): FormResult<never> {
  // Map specific error codes to user-friendly messages
  if (error.code === "invalid_credentials") {
    return {
      ok: false,
      error: {
        formErrors: ["Invalid email or password"],
        fieldErrors: {},
      },
    };
  }

  // Generic fallback
  return {
    ok: false,
    error: {
      formErrors: ["An unexpected error occurred"],
      fieldErrors: {},
    },
  };
}
```

### **Security Considerations**

**Credential Enumeration Prevention:**

- Don't reveal if email exists
- Use generic "Invalid email or password" message
- Same error for "user not found" and "wrong password"

**Error Sanitization:**

- Don't expose database errors
- Don't leak internal implementation details
- Provide helpful but safe error messages

---

## Testing Strategy

### **Component Tests**

Test React components with React Testing Library:

```typescript
describe('LoginForm', () => {
  it('should render form fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should display validation errors', async () => {
    render(<LoginForm />);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });
});
```

### **Server Action Tests**

Test Server Actions with mocked composition:

```typescript
describe("loginAction", () => {
  it("should return form errors on validation failure", async () => {
    const formData = new FormData();
    formData.set("email", "invalid");

    const result = await loginAction({}, formData);

    expect(result.ok).toBe(false);
    expect(result.error.fieldErrors.email).toBeDefined();
  });

  it("should redirect on success", async () => {
    const formData = new FormData();
    formData.set("email", "test@example.com");
    formData.set("password", "password123");

    // Mock composition
    jest.mock("@/modules/auth/infrastructure/composition/auth.composition");

    await expect(loginAction({}, formData)).rejects.toThrow("NEXT_REDIRECT");
  });
});
```

### **What to Test**

- ✅ Form rendering (all fields present)
- ✅ Validation errors (client and server)
- ✅ Error display (field and form errors)
- ✅ Loading states (isPending)
- ✅ Success redirects
- ✅ Accessibility (labels, ARIA attributes)

---

## Related Documentation

- **[Application Layer](../application/README.md)**: Workflows called by Server Actions
- **[Login Flow](../notes/flows/login-flow.md)**: Complete login flow from UI to database
- **[Signup Flow](../notes/flows/signup-flow.md)**: Complete signup flow
- **[Error Handling](../notes/flows/error-handling.md)**: Error transformation rules

---

## Quick Reference

### **Adding a New Server Action**

1. Create action file in `actions/`
2. Define input schema in `application/auth-user/schemas/`
3. Define field type in `transports/`
4. Create error mapper in `mappers/`
5. Call application workflow
6. Handle success (revalidate + redirect)
7. Add tests

### **Adding a New Form Component**

1. Create form component in `components/forms/`
2. Use `useActionState` hook
3. Add `AuthFormFeedback` for errors
4. Add form fields with proper labels
5. Add submit button with loading state
6. Add tests

### **Common Patterns**

**Server Action Pattern:**

```typescript
"use server";

export async function myAction(
  _prevState: FormResult<unknown>,
  formData: FormData,
): Promise<FormResult<never>> {
  const auth = await makeAuthComposition();
  const validated = await validateForm(formData, MySchema, fields);
  if (!validated.ok) return validated;

  const result = await auth.workflows.myWorkflow(validated.value.data);
  if (!result.ok) return toMyFormResult(result.error);

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
```

**Form Component Pattern:**

```typescript
export function MyForm() {
  const [state, formAction, isPending] = useActionState(myAction, initialState);

  return (
    <form action={formAction}>
      <AuthFormFeedback state={state} />
      {/* Form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? "Loading..." : "Submit"}
      </button>
    </form>
  );
}
```

---

## Best Practices

1. **Always validate server-side**: Client validation is optional, server validation is required
2. **Use type-safe forms**: Define field types and use them consistently
3. **Handle loading states**: Disable submit button while pending
4. **Display errors clearly**: Use `AuthFormFeedback` for consistent error display
5. **Prevent credential enumeration**: Use generic error messages
6. **Test accessibility**: Ensure forms work with keyboard and screen readers
7. **Progressive enhancement**: Forms should work without JavaScript
8. **Log operations**: Use structured logging for debugging

---

## Accessibility

### **Form Accessibility Checklist**

- ✅ All inputs have associated labels
- ✅ Error messages are announced to screen readers
- ✅ Forms can be submitted with keyboard (Enter key)
- ✅ Focus management (errors get focus)
- ✅ ARIA attributes for error states
- ✅ Sufficient color contrast
- ✅ Loading states are announced

### **Example Accessible Form**

```typescript
<form action={formAction} aria-label="Login form">
  <label htmlFor="email">Email</label>
  <input
    id="email"
    name="email"
    type="email"
    required
    aria-invalid={!!state.error?.fieldErrors?.email}
    aria-describedby={state.error?.fieldErrors?.email ? "email-error" : undefined}
  />
  {state.error?.fieldErrors?.email && (
    <span id="email-error" role="alert">
      {state.error.fieldErrors.email}
    </span>
  )}

  <button type="submit" disabled={isPending} aria-busy={isPending}>
    {isPending ? "Signing in..." : "Sign In"}
  </button>
</form>
```

---

## Maintenance

### **When to Update This Layer**

- Adding new authentication methods (OAuth, 2FA)
- Changing form layouts or styling
- Adding new form fields
- Modifying error messages
- Updating UI components

### **Breaking Changes**

Changes to Server Action signatures or form field names are breaking changes. Coordinate with:

- **Application layer**: Workflows and DTOs
- **Tests**: Update test expectations

---

## Future Improvements

### **Suggested Enhancements**

1. **Reorganize `components/shared/`**: Group by type (controls, feedback, layout, links, sections, ui)
2. **Add client-side hooks**: `useAuthForm`, `useLoginState` for client components
3. **Add session UI components**: Session status indicator, logout button
4. **Add loading skeletons**: Better loading states for forms
5. **Add animations**: Smooth transitions for error messages
6. **Add toast notifications**: Success/error toasts instead of redirects

---

**Last Updated**: 2026-02-01  
**Maintainer**: Auth Module Team
