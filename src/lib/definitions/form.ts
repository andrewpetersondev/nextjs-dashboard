// --- Centralized Generic Form State Type ---
/**
 * Generic form state for any form fields.
 */

// biome-ignore lint/style/useNamingConvention: TFields is appropriate because it represents a generic parameter for fields
export type FormState<TFields extends Record<string, unknown>> = {
	errors?: Partial<Record<keyof TFields, string[]>>;
	message?: string;
};
