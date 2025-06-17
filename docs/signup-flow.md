# Signup Flow Documentation

When a user submits the signup form, the following flow is triggered:

1. **Form Submission and Action Handling**  
   The `SignupForm` component in `src/ui/auth/signup-form.tsx` uses the `useActionState` React hook to bind the form's `action` to the `signup` server action:

   ```typescript
   const [state, action, pending] = useActionState<SignupFormState, FormData>(
     signup,
     { errors: {}, message: "" },
   );
   ```

   When the form is submitted, the `signup` function in `src/server-actions/users.ts` is called with the form data.

2. **Validation**  
   The `signup` server action validates the input using Zod schemas:

   ```typescript
   const validated = SignupFormSchema.safeParse({
     username: getFormField(formData, "username"),
     email: getFormField(formData, "email"),
     password: getFormField(formData, "password"),
   });
   if (!validated.success) {
     return actionResult({
       message: "Validation failed. Please check your input.",
       success: false,
       errors: normalizeFieldErrors(validated.error.flatten().fieldErrors),
     });
   }
   ```

   If validation fails, error messages are returned and displayed in the form.

3. **User Creation**  
   If validation passes, the server action calls `createUserInDB` to insert the new user into the database:

   ```typescript
   const user = await createUserInDB({
     username,
     email,
     password,
     role: "user",
   });
   ```

   If user creation fails, an error message is returned.

4. **Session Creation**  
   On successful user creation, a session is created for the new user:

   ```typescript
   await createSession(user.id, "user");
   ```

   This sets a secure session cookie for authentication.

5. **Redirect to Dashboard**  
   After the session is created, the user is redirected to the dashboard:

   ```typescript
   redirect("/dashboard");
   ```

   This is a server-side redirect, so the user is immediately taken to the dashboard page.

6. **Error Handling**  
   Any unexpected errors are logged and a generic error message is shown to the user.

**Summary:**  
After submitting the signup form, the input is validated, a user is created in the database, a session is established, and the user is redirected to the dashboard. If any step fails, appropriate error messages are displayed in the form.
