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

export const USER_SUCCESS_MESSAGES = {
  createSuccess: "User created successfully.",
  deleteSuccess: "User deleted successfully.",
  noChanges: "No changes detected.",
  PARSE_SUCCESS: "User data parsed successfully.",
  updateSuccess: "User updated successfully.",
} as const;
