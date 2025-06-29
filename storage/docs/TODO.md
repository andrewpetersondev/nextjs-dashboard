# TODO

- [ ] Rewrite all functions for stateless authentication by creating cookies on the server.
- [ ] .safeParseAsync for zod
- [ ] types/interfaces/schemas for user and session appear to be a mess
- [ ] drizzle seed works ok, the demo users table is functional but it does not function as expected.
- [ ] drizzle seed needs to be updated so that customers align with name, email, picture]

---

## Chat 6/9

### **Best Practices Not Fully Implemented**

1. **Testing**
   - No test code or test mocks are shown for DAL, mappers, or DTOs.
   - **Best practice:** Add unit and integration tests, mock dB access, and use Cypress for E2E/component tests.

2. **Validation**
   - While you use Zod for form validation, there’s no explicit validation for API input or output in the DAL or API routes.
   - **Best practice:** Validate all user input and output at API boundaries.

3. **Error Handling**
   - Errors are logged, but there’s no global error boundary or structured logging for client-side errors.
   - **Best practice:** Implement React error boundaries and structured logging.

4. **Documentation**
   - Some JSDoc is present, but not all public APIs/components are documented.
   - **Best practice:** Ensure all exported functions, DTOs, and components have clear documentation.

5. **Security**
   - No explicit mention of secrets management (Docker secrets or `.env`), though you use `process.env`.
   - **Best practice:** Use Docker secrets for production, never commit secrets.

6. **CI/CD**
   - No CI/CD config is shown.
   - **Best practice:** Use GitHub Actions for linting, type checks, and tests on PRs.

---

### **Summary Table**

| Area               | InvoiceStatusComponent | Recommendation                                  |
| ------------------ | ---------------------- | ----------------------------------------------- |
| Testing            | ⚠️                     | Add unit/E2E/component tests, mock dB in tests  |
| Validation         | ⚠️                     | Validate all API input/output                   |
| Error Handling     | ⚠️                     | Add global error boundaries, structured logging |
| Documentation      | ⚠️                     | Document all public APIs/components             |
| Secrets Management | ⚠️                     | Use Docker secrets for production               |
| CI/CD              | ⚠️                     | Add GitHub Actions for CI/CD                    |

---

**Action:**

- Add/expand tests, validation, error boundaries, and documentation.
- Review secrets and CI/CD setup.
