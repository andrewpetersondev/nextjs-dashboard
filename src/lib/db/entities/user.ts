// --- User Entity ---

import type { UserRole } from "@/src/lib/definitions/enums.ts";

export interface UserEntity {
	id: string;
	username: string;
	email: string;
	role: UserRole;
	password: string;
	sensitiveData: string;
}
