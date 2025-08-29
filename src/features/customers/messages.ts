type TemplateParams = Record<
  string,
  string | number | boolean | null | undefined
>;

const SEARCH_VALUE_REGEX = /\{(\w+)}/g;

export function formatMessage(
  template: string,
  params: TemplateParams = {},
): string {
  return template.replace(SEARCH_VALUE_REGEX, (_, key) => {
    const value = params[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

// Error codes (stable identifiers)
export const CustomerErrorCode = {
  CreateFailed: "CUSTOMER.CREATE_FAILED",
  DeleteFailed: "CUSTOMER.DELETE_FAILED",
  FetchAllFailed: "CUSTOMER.FETCH_ALL_FAILED",
  FetchFilteredFailed: "CUSTOMER.FETCH_FILTERED_FAILED",
  FetchLatestFailed: "CUSTOMER.FETCH_LATEST_FAILED",
  FetchPagesFailed: "CUSTOMER.FETCH_PAGES_FAILED",
  FetchTotalFailed: "CUSTOMER.FETCH_TOTAL_FAILED",
  InvalidInput: "CUSTOMER.INVALID_INPUT",
  NotFound: "CUSTOMER.NOT_FOUND",
  ReadFailed: "CUSTOMER.READ_FAILED",
  UpdateFailed: "CUSTOMER.UPDATE_FAILED",
} as const;

export type CustomerErrorCode =
  (typeof CustomerErrorCode)[keyof typeof CustomerErrorCode];

export const customerErrorMessages: Record<CustomerErrorCode, string> = {
  [CustomerErrorCode.CreateFailed]: "Failed to create customer.",
  [CustomerErrorCode.DeleteFailed]: "Failed to delete customer.",
  [CustomerErrorCode.FetchAllFailed]: "Failed to fetch all customers.",
  [CustomerErrorCode.FetchFilteredFailed]:
    "Failed to fetch filtered customers.",
  [CustomerErrorCode.FetchLatestFailed]: "Failed to fetch latest customers.",
  [CustomerErrorCode.FetchPagesFailed]:
    "Failed to fetch total number of customer pages.",
  [CustomerErrorCode.FetchTotalFailed]: "Failed to fetch total customers.",
  [CustomerErrorCode.InvalidInput]: "Invalid input. Please check your data.",
  [CustomerErrorCode.NotFound]: "Customer not found.",
  [CustomerErrorCode.ReadFailed]: "Failed to read customer.",
  [CustomerErrorCode.UpdateFailed]: "Failed to update customer.",
} as const;

export function getCustomerErrorMessage(
  code: CustomerErrorCode,
  params?: TemplateParams,
  overrides?: Partial<Record<CustomerErrorCode, string>>,
): string {
  const template =
    overrides?.[code] ?? customerErrorMessages[code] ?? "An error occurred.";
  return formatMessage(template, params);
}

// Success codes (stable identifiers)
export const CustomerSuccessCode = {
  Created: "CUSTOMER.CREATED",
  Deleted: "CUSTOMER.DELETED",
  Suspended: "CUSTOMER.SUSPENDED",
  Updated: "CUSTOMER.UPDATED",
} as const;

export type CustomerSuccessCode =
  (typeof CustomerSuccessCode)[keyof typeof CustomerSuccessCode];

export const customerSuccessMessages: Record<CustomerSuccessCode, string> = {
  [CustomerSuccessCode.Created]: "Customer “{name}” was created.",
  [CustomerSuccessCode.Updated]: "Customer “{name}” was updated.",
  [CustomerSuccessCode.Deleted]: "Customer “{name}” was deleted.",
  [CustomerSuccessCode.Suspended]: "Customer “{name}” has been suspended.",
} as const;

export function getCustomerSuccessMessage(
  code: CustomerSuccessCode,
  params?: TemplateParams,
  overrides?: Partial<Record<CustomerSuccessCode, string>>,
): string {
  const template =
    overrides?.[code] ?? customerSuccessMessages[code] ?? "Success.";
  return formatMessage(template, params);
}
