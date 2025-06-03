# Data Transfer Objects (DTOs)

## What is a DTO?

**Data Transfer Objects (DTOs)** are simple, serializable objects used to transfer data between different layers or components of an application. They are especially useful for:

- **Backend ↔️ Frontend communication**
- **Service layer ↔️ API consumers**

DTOs are not domain models or entities. They are designed to carry only the data required for a specific operation, often omitting sensitive or unnecessary fields.

---

## Why Use DTOs?

- **Security:** Prevents exposure of sensitive or internal data structures (e.g., passwords, internal IDs).
- **Performance:** Reduces payload size by sending only the necessary data.
- **Decoupling:** Shields internal models from external consumers, allowing you to change your backend without breaking clients.
- **Validation:** Enables strict validation and transformation of data before it leaves or enters your application.

---

## Best Practices

- **Return only required fields:** Avoid sending entire objects. For example, return only `id` and `name` for a user, not passwords or internal metadata.
- **Explicitly define DTOs:** Use TypeScript interfaces or classes to define DTO shapes.
- **Validate and sanitize:** Always validate incoming and outgoing data to prevent security issues.
- **Map between entities and DTOs:** Use mapping functions or libraries to convert between your database models and DTOs.

---

## Example

Suppose you have a `User` entity in your database:

```typescript
// src/db/entities/user.ts
export interface UserEntity {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
```

You want to expose only safe fields to the frontend:

```ts

// src/dto/user.dto.ts
export interface UserDTO {
  id: string;
  name: string;
  email: string;
}
```

Mapping function:
```typescript
// src/mappers/user.mapper.ts
import { UserEntity } from '@/db/entities/user';
import { UserDTO } from '@/dto/user.dto';

export function toUserDTO(user: UserEntity): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
```
--- 
## When to Use DTOs

- **API responses:** Always use DTOs to control what data is sent to clients.
- **Inter-service communication:** Use DTOs to define contracts between microservices or modules.
- **Form submissions:** Validate and transform incoming data into DTOs before processing.
---
## Summary
DTOs are a key pattern for building secure, maintainable, and scalable applications. They help you:


* Expose only what is necessary
* Protect sensitive data
* Decouple internal models from external consumers
* Enforce data validation and transformation

**Tip:** Always keep your DTOs up-to-date with your API contracts and document them for consumers.

