import type { UserRole } from "@/lib/definitions/users.types";

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

// PROBLEM: convert code so database calls use mapper, which returns DTO
// Db CALL --> MAPPER --> DTO
// SOLVED

// 	PROBLEM: fetchUserById in query/users.dal.ts can return undefined
// POSSIBLE SOLUTIONS:
// 1. temporarily configure userDTO to return undefined
// 2. do not allow fetchUserById to return Undefined
