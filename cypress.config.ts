import path from "node:path";
import webpackPreprocessor from "@cypress/webpack-preprocessor";
import { defineConfig } from "cypress";
import * as dotenv from "dotenv";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import {
	CYPRESS_BASE_URL,
	DATABASE_ENV,
	DATABASE_URL,
	SESSION_SECRET,
} from "./cypress/node/config/cypress-env";
import { registerCypressTasks } from "./cypress/node/tasks/register-tasks";

const webpackOptions = {
	mode: "development" as const,
	module: {
		rules: [
			{
				exclude: [/node_modules/],
				test: /\.tsx?$/,
				use: [
					{
						loader: "ts-loader",
						options: {
							configFile: path.resolve(process.cwd(), "cypress/tsconfig.json"),
							transpileOnly: true,
						},
					},
				],
			},
		],
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".json"],
		plugins: [
			new TsconfigPathsPlugin({
				configFile: path.resolve(process.cwd(), "tsconfig.json"),
			}),
		],
	},
};

export default defineConfig({
	e2e: {
		baseUrl: "http://localhost:3001",

		// biome-ignore lint/suspicious/useAwait: setupNodeEvents may remain async for future async setup
		async setupNodeEvents(on, config) {
			dotenv.config({ path: ".env.test.local" });

			on(
				"file:preprocessor",
				webpackPreprocessor({
					webpackOptions,
				}),
			);

			config.baseUrl = CYPRESS_BASE_URL;
			config.env.DATABASE_ENV = DATABASE_ENV;
			config.env.DATABASE_URL = DATABASE_URL;
			config.env.SESSION_SECRET = SESSION_SECRET;

			registerCypressTasks(on, config);

			return config;
		},
	},
	env: {},
	video: false,
	watchForFileChanges: false,
});
