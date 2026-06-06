/**
 * Build a `FormData` from a plain record.
 *
 * Replaces the per-spec `createLoginFormData` / `createFormData` /
 * `createSignupFormData` helpers — specs pass only the fields they care about.
 */
export function buildFormData(fields: Record<string, string>): FormData {
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) {
		formData.append(name, value);
	}
	return formData;
}
