# TODO

- [x] remove console.log from production-ready code
- [ ] delete user function
- [x] fine-tune users page and functions
- [x] refactor definitions
- [ ] when the database is freshly created and seeded, users WILL NOT be able to use DEMO buttons, because drizzle seed is corrupting the intended data.  
- [ ] restricted pages are not working properly after recent changes on 6/9. any user can access restricted pages.


----
## Server Actions

```ts
// TODO: Rewrite all functions for stateless authentication by creating cookies on the server.
/*
 *  To create a cookie I need users.id, sessions.userId, expiresAt, users.role
 *  users.id is created in database
 *  sessions.userId is created in db, may not be necessary because it gives the same info as users.id
 * expiresAt is created in code and encrypt ()
 * for  now, every user's role is set to "user" by default from the db.
 *  soon I will determine who is an admin based off an enumerated list of email addresses.
 * i do not have access to  users.role in signup () because the only thing that gets returned is users.id, so i will
 * hardcode in the user role to signup()
 * signup () can be part of the DAL because verifySessionOptimistic() is impossible without database sessions
 * */
// TODO: may need to update zod to use .safeParseAsync()
```

## Chat 6/9

Here’s a concise review of your current implementation versus the provided best practices.  
**You are following most core practices well, but here are some areas for improvement:**

---

### **Best Practices Not Fully Implemented**

1. **DTO Security**
    - Your `UserDTO` in `src/dto/user.dto.ts` still includes the `password` field.  
      **Best practice:** Never expose `password` (or any sensitive field) in DTOs sent to the client.

2. **Sensitive Data Handling**
    - The `toUserDTO` mapper in `src/mappers/user.mapper.ts` also includes `password`.  
      **Best practice:** Exclude `password` and any sensitive fields from DTOs and mappers.

3. **Testing**
    - No test code or test mocks are shown for DAL, mappers, or DTOs.
    - **Best practice:** Add unit and integration tests, mock DB access, and use Cypress for E2E/component tests.

4. **Validation**
    - While you use Zod for form validation, there’s no explicit validation for API input or output in the DAL or API routes.
    - **Best practice:** Validate all user input and output at API boundaries.

5. **Error Handling**
    - Errors are logged, but there’s no global error boundary or structured logging for client-side errors.
    - **Best practice:** Implement React error boundaries and structured logging.

6. **Documentation**
    - Some JSDoc is present, but not all public APIs/components are documented.
    - **Best practice:** Ensure all exported functions, DTOs, and components have clear documentation.

7. **Security**
    - No explicit mention of secrets management (Docker secrets or `.env`), though you use `process.env`.
    - **Best practice:** Use Docker secrets for production, never commit secrets.

8. **CI/CD**
    - No CI/CD config is shown.
    - **Best practice:** Use GitHub Actions for linting, type checks, and tests on PRs.

---

### **Summary Table**

| Area                | Status         | Recommendation                                      |
|---------------------|---------------|-----------------------------------------------------|
| DTO Security        | ❌            | Remove `password` from DTOs/mappers                 |
| Sensitive Data      | ❌            | Never expose sensitive fields to client             |
| Testing             | ⚠️            | Add unit/E2E/component tests, mock DB in tests      |
| Validation          | ⚠️            | Validate all API input/output                       |
| Error Handling      | ⚠️            | Add global error boundaries, structured logging     |
| Documentation       | ⚠️            | Document all public APIs/components                 |
| Secrets Management  | ⚠️            | Use Docker secrets for production                   |
| CI/CD               | ⚠️            | Add GitHub Actions for CI/CD                        |

---

**Action:**
- Remove `password` from `UserDTO` and `toUserDTO`.
- Add/expand tests, validation, error boundaries, and documentation.
- Review secrets and CI/CD setup.

Let me know if you want code examples for any of these improvements.
