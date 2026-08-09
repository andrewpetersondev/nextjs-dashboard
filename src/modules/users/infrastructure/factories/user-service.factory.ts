import "server-only";
import { UserService } from "@/modules/users/application/services/user.service";
import { UserRepositoryImpl } from "@/modules/users/infrastructure/repository/user.repository";
import { UserRepositoryAdapter } from "@/modules/users/infrastructure/repository/user-repository.adapter";
import { createHashingService } from "@/server/crypto/hashing/hashing.factory";
import type { AppDatabase } from "@/server/db/db.connection";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

/**
 * Composition root for the users module — the only place its dependencies are
 * wired.
 *
 * The repository is built in two layers on purpose: `UserRepositoryImpl` speaks
 * Drizzle, and `UserRepositoryAdapter` presents it as the port the application
 * layer depends on. Swapping persistence means replacing the impl and leaving
 * everything above it untouched.
 */
export function createUserService(db: AppDatabase): UserService {
	const repoImpl = new UserRepositoryImpl(db);
	const repoAdapter = new UserRepositoryAdapter(repoImpl);
	const hasher = createHashingService();

	return new UserService(repoAdapter, hasher, logger);
}
