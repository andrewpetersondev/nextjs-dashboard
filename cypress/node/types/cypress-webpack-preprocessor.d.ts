// @cypress/webpack-batteries-included-preprocessor ships no type definitions.
// Minimal surface for the one call site in cypress.config.ts.
declare module "@cypress/webpack-batteries-included-preprocessor" {
	interface PreprocessorOptions {
		/** Absolute path to the TypeScript package the preprocessor should use. */
		typescript?: string;
		webpackOptions?: Record<string, unknown>;
	}

	type FilePreprocessor = (
		file: Cypress.FileObject,
	) => string | Promise<string>;

	function webpackBatteriesIncludedPreprocessor(
		options?: PreprocessorOptions,
	): FilePreprocessor;

	export = webpackBatteriesIncludedPreprocessor;
}
