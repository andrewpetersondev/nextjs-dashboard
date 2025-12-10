import "server-only";
import type { PasswordHash } from "@/modules/auth/domain/password/password.types";

export interface PasswordHasherPort {
  compare(raw: string, hash: PasswordHash): Promise<boolean>;

  hash(raw: string): Promise<PasswordHash>;
}
