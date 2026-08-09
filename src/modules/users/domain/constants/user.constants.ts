/**
 * Rows per page for user listings.
 *
 * Separate from the invoices/customers `ITEMS_PER_PAGE` in
 * `ui/navigation/pagination` — same value today, but independent, so changing
 * one does not move the other.
 */
export const ITEMS_PER_PAGE_USERS = 10;

/**
 * Failure copy for the users module.
 *
 * `invalidCredentials` is deliberately vague about which half was wrong: naming
 * it would let an attacker enumerate accounts.
 */
export const USER_ERROR_MESSAGES = {
	createFailed: "Failed to create an account. Please try again.",
	deleteFailed: "User not found or could not be deleted.",
	fetchCount: "Failed to fetch user count.",
	invalidCredentials: "Invalid email or password.",
	noChanges: "No changes to update.",
	notFound: "User not found.",
	notFoundOrDeleteFailed: "User not found or could not be deleted.",
	readFailed: "Failed to read user data.",
	unexpected: "An unexpected error occurred. Please try again.",
	updateFailed: "Failed to update user. Please try again.",
	validationFailed: "Validation failed. Please check your input.",
} as const;

/** Confirmation copy for the users module, paired with {@link USER_ERROR_MESSAGES}. */
export const USER_SUCCESS_MESSAGES = {
	createSuccess: "User created successfully.",
	deleteSuccess: "User deleted successfully.",
	noChanges: "No changes detected.",
	parseSuccess: "User data parsed successfully.",
	updateSuccess: "User updated successfully.",
} as const;
