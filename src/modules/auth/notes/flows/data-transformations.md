## 🔍 Key Data Transformations

| Layer                   | Input Type             | Output Type            | Mapper/Function               |
| ----------------------- | ---------------------- | ---------------------- | ----------------------------- |
| **DAL → Repository**    | `UserRow`              | `AuthUserEntity`       | `toAuthUserEntity()`          |
| **Use Case → Workflow** | `AuthUserEntity`       | `AuthenticatedUserDto` | `toAuthenticatedUserDto()`    |
| **Workflow → Session**  | `AuthenticatedUserDto` | `SessionPrincipalDto`  | `toSessionPrincipal()`        |
| **Session → Token**     | `SessionPrincipalDto`  | `IssuedTokenDto`       | `SessionTokenService.issue()` |
| **Error → UI**          | `AppError`             | `FormResult<never>`    | `toLoginFormResult()`         |

---
