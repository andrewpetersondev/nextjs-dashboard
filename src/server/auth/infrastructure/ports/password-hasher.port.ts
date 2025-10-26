import type { PasswordHash } from "@/features/auth/lib/password.types";

export interface PasswordHasher {
  // Raw password is plain string for now.
  hash(raw: string): Promise<PasswordHash>;
  compare(raw: string, hash: PasswordHash): Promise<boolean>;
}
