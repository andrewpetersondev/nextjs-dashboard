import "server-only";
import type { UserRepositoryContract } from "@/modules/users/application/contracts/user-repository.contract";
import type {
	CreateUserProps,
	UpdateUserProps,
	UserEntity,
} from "@/modules/users/domain/entities/user.entity";
import type { UserId } from "@/modules/users/domain/types/user-id.brand";
import type { UserRepositoryImpl } from "@/modules/users/infrastructure/repository/user.repository";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { Result } from "@/shared/core/result/result.dto";

/**
 * Presents `UserRepositoryImpl` as the port the application layer depends on.
 *
 * Every method except `withTransaction` forwards untouched, which looks
 * redundant until you notice what it buys: the application layer names only
 * `UserRepositoryContract`, so the Drizzle-shaped implementation stays swappable
 * and testable without the two ever being coupled. Add behaviour to the impl,
 * not here.
 */
export class UserRepositoryAdapter
	implements UserRepositoryContract<UserRepositoryImpl>
{
	private readonly repo: UserRepositoryImpl;

	constructor(repo: UserRepositoryImpl) {
		this.repo = repo;
	}

	create(input: CreateUserProps): Promise<Result<UserEntity | null, AppError>> {
		return this.repo.create(input);
	}

	delete(id: UserId): Promise<Result<UserEntity | null, AppError>> {
		return this.repo.delete(id);
	}

	readById(id: UserId): Promise<Result<UserEntity | null, AppError>> {
		return this.repo.readById(id);
	}

	readFilteredUsers(
		query: string,
		page: number,
	): Promise<Result<UserEntity[], AppError>> {
		return this.repo.readFilteredUsers(query, page);
	}

	readPageCount(query: string): Promise<Result<number, AppError>> {
		return this.repo.readPageCount(query);
	}

	update(
		id: UserId,
		patch: UpdateUserProps,
	): Promise<Result<UserEntity | null, AppError>> {
		return this.repo.update(id, patch);
	}

	/**
	 * The one method that does more than forward: it re-wraps the transaction
	 * repository in a fresh adapter, so the callback receives the port rather
	 * than the raw impl and the abstraction holds inside the transaction too.
	 */
	withTransaction<T>(
		fn: (txRepo: UserRepositoryContract<UserRepositoryImpl>) => Promise<T>,
	): Promise<T> {
		return this.repo.withTransaction(async (txRepo) => {
			const txAdapter = new UserRepositoryAdapter(txRepo);
			return await fn(txAdapter);
		});
	}
}
