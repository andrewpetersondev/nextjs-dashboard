import "server-only";
import { BcryptPasswordHasherAdapter } from "@/modules/auth/server/infrastructure/adapters/password-hasher-bcrypt.adapter";
import { UserService } from "@/modules/users/server/application/services/user.service";
import { UserRepositoryAdapter } from "@/modules/users/server/infrastructure/repository/adapters/user-repository.adapter";
import { UserRepositoryImpl } from "@/modules/users/server/infrastructure/repository/user.repository";
import type { AppDatabase } from "@/server-core/db/db.connection";
import { logger } from "@/shared/logging/infrastructure/logging.client";

export function createUserService(db: AppDatabase): UserService {
  const repoImpl = new UserRepositoryImpl(db);
  const repoAdapter = new UserRepositoryAdapter(repoImpl);
  const hasher = new BcryptPasswordHasherAdapter();

  return new UserService(repoAdapter, hasher, logger);
}
