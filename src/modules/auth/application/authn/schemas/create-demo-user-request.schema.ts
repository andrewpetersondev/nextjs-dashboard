import type { UserRole } from "@/shared/domain/user/user-role.schema";

/**
 * Input DTO for "create demo user".
 *
 * This workflow/use-case expects a role directly, so the request DTO is that role.
 */
export type CreateDemoUserRequestDto = UserRole;
