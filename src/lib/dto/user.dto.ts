import type { UserRole } from "@/src/lib/definitions/roles";

/**
 ** User Data Transfer Object (DTO) for frontend.
 ** Only exposes safe fields.
 ** Strips sensitive data from DB calls
 ** Server <---> DTO <---> Client
 ** This example strips the user property of **SensitiveData**
 */
export interface UserDTO {
	id: string;
	username: string;
	email: string;
	role: UserRole;
}

// PROBLEM: convert code so database calls use mapper, which returns DTO
// DB CALL --> MAPPER --> DTO
// SOLVED

// 	PROBLEM: fetchUserById in query/users.ts can return undefined
// POSSIBLE SOLUTIONS:
// 1. temporarily configure userDTO to return undefined
// 2. do not allow fetchUserById to return Undefined
