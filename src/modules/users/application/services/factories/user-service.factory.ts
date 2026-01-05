import "server-only";
import { UserService } from "@/modules/users/application/services/user.service";
import { UserRepositoryAdapter } from "@/modules/users/infrastructure/repository/adapters/user-repository.adapter";
import { UserRepositoryImpl } from "@/modules/users/infrastructure/repository/user.repository";
import { createHashingService } from "@/server/crypto/hashing/hashing.factory";
import type { AppDatabase } from "@/server/db/db.connection";
import { logger } from "@/shared/logging/infrastructure/logging.client";

export function createUserService(db: AppDatabase): UserService {
  const repoImpl = new UserRepositoryImpl(db);
  const repoAdapter = new UserRepositoryAdapter(repoImpl);
  const hasher = createHashingService();

  return new UserService(repoAdapter, hasher, logger);
}
