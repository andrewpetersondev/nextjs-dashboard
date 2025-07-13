import type { UserRole } from "@/features/users/user.types";

/**
 ** User Data Transfer Object (DTO) for frontend.
 ** Only exposes safe fields.
 ** Strips sensitive data from Db calls
 ** Server <---> DTO <---> Client
 ** This example strips the user property of **SensitiveData**
 */

export interface UserDto {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly role: UserRole;
}
