import "server-only";
import type { PasswordHash } from "@/modules/auth/domain/password/password.types";

export interface PasswordHasherPort {
  hash(raw: string): Promise<PasswordHash>;
  compare(raw: string, hash: PasswordHash): Promise<boolean>;
}
