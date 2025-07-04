// --- Centralized Generic Form State Type ---
/**
 * Generic form state for any form fields.
 */
export type FormState<TFields extends Record<string, unknown>> = {
	errors?: Partial<Record<keyof TFields, string[]>>;
	message?: string;
};
