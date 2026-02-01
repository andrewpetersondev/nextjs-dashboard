# Auth Module Flow Documentation

This directory contains comprehensive documentation of all data flows in the authentication module. Each document traces how data moves through the system from entry point to exit point, including all transformations, validations, and error handling.

## 📚 Available Flow Documentation

### Core Authentication Flows

- **[login-flow.md](./login-flow.md)** - Complete login flow from UI to database and back
  - User credential validation
  - Password verification
  - Session establishment
  - Cookie management
  - Error handling and security considerations

- **[signup-flow.md](./signup-flow.md)** - User registration and account creation
  - Input validation
  - Password hashing
  - Database insertion
  - Duplicate detection
  - Automatic session establishment

### Session Management Flows

- **[session-lifecycle.md](./session-lifecycle.md)** - Session creation, validation, rotation, and termination
  - JWT token generation
  - Token validation and verification
  - Session rotation strategy
  - Logout and cleanup
  - Security policies

### Supporting Documentation

- **[data-transformations.md](./data-transformations.md)** - All data mappers and transformations
  - Mapper registry
  - Transformation chains
  - Security boundaries
  - Type conversions

- **[error-handling.md](./error-handling.md)** - Error propagation and transformation
  - Error types by layer
  - Error transformation rules
  - Security considerations
  - User-facing error messages

## 🎯 Purpose

These flow documents serve multiple purposes:

1. **Onboarding** - Help new developers understand the complete authentication system
2. **Debugging** - Trace issues through the entire flow
3. **Architecture** - Document design decisions and patterns
4. **Security** - Highlight security boundaries and considerations
5. **Maintenance** - Identify where to make changes for new features

## 🔍 How to Use This Documentation

### For New Developers

1. Start with **login-flow.md** to understand the most common flow
2. Read **data-transformations.md** to understand how data changes shape
3. Review **error-handling.md** to understand error propagation
4. Explore **session-lifecycle.md** for session management details

### For Debugging

1. Identify which flow is failing (login, signup, session validation, etc.)
2. Open the corresponding flow document
3. Trace through the steps to find where the issue occurs
4. Check the error handling section for expected error scenarios

### For Adding Features

1. Review the relevant flow document to understand current behavior
2. Identify where your changes fit in the flow
3. Update the flow document with your changes
4. Ensure error handling is documented

## 📊 Flow Visualization

Each flow document includes:

- **ASCII diagrams** showing the complete flow
- **Layer boundaries** (Presentation → Application → Domain → Infrastructure)
- **Data transformations** at each step
- **Error paths** showing how errors propagate
- **Security checkpoints** where validation occurs

## 🔗 Related Documentation

- **[../flowcharts.md](../flowcharts.md)** - Visual flowcharts for key processes
- **[../sequence-diagrams.md](../sequence-diagrams.md)** - Sequence diagrams for interactions
- **[../../application/shared/mappers/mapper-registry.ts](../../application/shared/mappers/mapper-registry.ts)** - Complete mapper registry
- **[../../application/shared/mappers/mapper-chains.ts](../../application/shared/mappers/mapper-chains.ts)** - Transformation chains

## 🛠️ Maintenance

When making changes to the auth module:

1. ✅ **Update the relevant flow document** if you change the flow
2. ✅ **Update mapper-registry.ts** if you add/remove/move mappers
3. ✅ **Update mapper-chains.ts** if you change transformation chains
4. ✅ **Update error-handling.md** if you add new error types
5. ✅ **Keep diagrams in sync** with code changes

## 📝 Document Structure

Each flow document follows this structure:

```markdown
# [Flow Name] Flow

## Overview

- Entry point
- Exit point
- Purpose

## Complete Flow Diagram

- ASCII diagram of the full flow

## Step-by-Step Breakdown

1. Layer 1: Presentation
2. Layer 2: Application
3. Layer 3: Domain
4. Layer 4: Infrastructure
5. Return path

## Data Transformations

- List of all mappers used
- Input/output types
- Security implications

## Error Handling

- Possible errors at each step
- Error transformation rules
- User-facing messages

## Security Considerations

- Authentication checks
- Authorization checks
- Data sanitization
- Credential enumeration prevention

## Performance Considerations

- Database queries
- Crypto operations
- Caching opportunities

## Related Files

- Links to all files involved in the flow
```

## 🚀 Quick Reference

| Flow                   | Entry Point        | Exit Point         | Key Files                                  |
| ---------------------- | ------------------ | ------------------ | ------------------------------------------ |
| **Login**              | `login.action.ts`  | Dashboard redirect | `login.workflow.ts`, `login.use-case.ts`   |
| **Signup**             | `signup.action.ts` | Dashboard redirect | `signup.workflow.ts`, `signup.use-case.ts` |
| **Session Validation** | Middleware         | Session data       | `read-session.use-case.ts`                 |
| **Session Rotation**   | Middleware         | New token          | `rotate-session.use-case.ts`               |
| **Logout**             | `logout.action.ts` | Login redirect     | `logout.workflow.ts`                       |

## 📞 Questions?

If you have questions about any flow:

1. Check the specific flow document first
2. Review the mapper-registry.ts for transformation details
3. Look at the actual code files referenced in the flow
4. Ask the team if something is unclear or outdated

---

**Last Updated**: 2026-02-01  
**Maintained By**: Auth Module Team
