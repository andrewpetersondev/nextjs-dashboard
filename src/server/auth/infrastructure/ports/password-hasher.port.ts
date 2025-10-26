import "server-only";
import type { PasswordHash } from "@/features/auth/lib/password.types";

export interface PasswordHasher {
  hash(raw: string): Promise<PasswordHash>;
  compare(raw: string, hash: PasswordHash): Promise<boolean>;
}
