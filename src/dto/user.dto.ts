import type { UserRole } from "@/src/lib/definitions/users";

/**
 ** Strips sensitive data from DB calls
 ** Server <---> DTO <---> Client
 ** This example strips the user property of **SensitiveData**
 */
export interface UserDTO {
	id: string;
	username: string;
	email: string;
	role: UserRole;
	password: string;
}

// PROBLEM: convert code so database calls use mapper which returns dto
// DB CALL --> MAPPER --> DTO
// SOLVED

// 	PROBLEM : fetchUserById in query/users.ts can return undefined
// POSSIBLE SOLUTIONS:
// 1. temporarily configure userDTO to return undefined
// 2. do not allow fetchUserById to return Undefined
// *
