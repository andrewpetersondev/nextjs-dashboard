import type { PasswordHash } from "@/server/auth/domain/types/password.types";

export interface PasswordHasher {
  // Raw password is plain string for now.
  hash(raw: string): Promise<PasswordHash>;
  compare(raw: string, hash: PasswordHash): Promise<boolean>;
}
