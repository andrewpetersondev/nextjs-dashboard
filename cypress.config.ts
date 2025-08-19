import "tsconfig-paths/register";
import path from "node:path";
import { fileURLToPath } from "node:url";
import webpackPreprocessor from "@cypress/webpack-preprocessor";
import { defineConfig } from "cypress";
import { dbTasks } from "./cypress/support/db-tasks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
      const options = {
        webpackOptions: {
          module: {
            rules: [
              {
                loader: "ts-loader",
                options: {
                  configFile: "cypress/tsconfig.json",
                },
                test: /\.tsx?$/,
              },
            ],
          },
          resolve: {
            alias: {
              "@": path.resolve(__dirname, "../src"),
            },
            extensions: [".ts", ".tsx", ".js", ".jsx"],
          },
        },
      };

      on("file:preprocessor", webpackPreprocessor(options));

      // Register your custom db tasks
      on("task", dbTasks);

      return config;
    },
    supportFile: "cypress/support/index.ts",
  },
});
