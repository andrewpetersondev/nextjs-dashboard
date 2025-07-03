export class ValidationError extends Error {
	// biome-ignore lint/style/useConsistentMemberAccessibility: <it is a class property>
	public details: unknown;
	constructor(message: string, details?: unknown) {
		super(message);
		this.name = "ValidationError";
		this.details = details;
	}
}
