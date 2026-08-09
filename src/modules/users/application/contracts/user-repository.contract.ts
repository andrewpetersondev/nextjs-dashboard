import "server-only";
import type {
	CreateUserProps,
	UpdateUserProps,
	UserEntity,
} from "@/modules/users/domain/entities/user.entity";
import type { UserId } from "@/modules/users/domain/types/user-id.brand";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { Result } from "@/shared/core/result/result.dto";

/**
 * Port the users application layer depends on for persistence.
 *
 * Every method returns a `Result` rather than throwing, and the `| null` inside
 * the `Ok` branch is meaningful: `Ok(null)` means "no such user", an ordinary
 * outcome, while `Err` means the operation genuinely failed. Treating a missing
 * user as an error is the mistake this shape exists to prevent.
 *
 * @typeParam Trepo - The concrete repository type threaded through
 * {@link UserRepositoryContract.withTransaction}; callers never supply it.
 */
export interface UserRepositoryContract<Trepo = unknown> {
	create(input: CreateUserProps): Promise<Result<UserEntity | null, AppError>>;

	delete(id: UserId): Promise<Result<UserEntity | null, AppError>>;

	readById(id: UserId): Promise<Result<UserEntity | null, AppError>>;

	readFilteredUsers(
		query: string,
		page: number,
	): Promise<Result<UserEntity[], AppError>>;

	readPageCount(query: string): Promise<Result<number, AppError>>;

	update(
		id: UserId,
		patch: UpdateUserProps,
	): Promise<Result<UserEntity | null, AppError>>;

	/**
	 * Runs `fn` against a transaction-scoped repository.
	 *
	 * Use the repository handed to the callback, not the outer one — work done
	 * through the outer instance runs outside the transaction and will not roll
	 * back with it.
	 */
	withTransaction<Tresult>(
		fn: (txRepo: UserRepositoryContract<Trepo>) => Promise<Tresult>,
	): Promise<Tresult>;
}
