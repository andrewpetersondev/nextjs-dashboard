import { defineConfig } from "cypress";
import { dbTasks } from "./cypress/support/db-tasks";

// Constants for magic values
const DEFAULT_BASE_URL = "http://localhost:3000";

// Cypress configuration for Next.js v15+ (App Router), TypeScript, and ESM
const config = defineConfig({
  // Component testing configuration
  component: {
    devServer: {
      bundler: "webpack", // Turbopack not yet supported by Cypress
      framework: "next",
    },
    specPattern: "cypress/component/**/*.cy.{ts,tsx}", // Supports .cy.ts and .cy.tsx
    supportFile: "cypress/support/index.ts",
    // Optionally exclude snapshot/image files if used
    // excludeSpecPattern: ["**/__snapshots__/*", "**/__image_snapshots__/*"],
    viewportHeight: 720,
    viewportWidth: 1280,
  },

  // End-to-end testing configuration
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? DEFAULT_BASE_URL, // Use env var for flexibility
    setupNodeEvents(on, config) {
      // Register custom DB tasks for test setup/teardown
      on("task", dbTasks);
      return config;
    },
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}", // Supports .cy.ts and .cy.tsx
    supportFile: "cypress/support/index.ts",
    // Optionally exclude snapshot/image files if used
    // excludeSpecPattern: ["**/__snapshots__/*", "**/__image_snapshots__/*"],
    viewportHeight: 720,
    viewportWidth: 1280,
  },
  // Environment variables (secrets managed via Hashicorp Vault)
  env: {
    SESSION_SECRET: process.env.SESSION_SECRET, // Never commit secrets
  },

  // General Cypress settings
  fileServerFolder: ".", // Serve files from the project root
  screenshotOnRunFailure: true, // Enable screenshots on failure for debugging
  trashAssetsBeforeRuns: true, // Clean up assets before each run
  video: false, // Disable video recording for CI performance
  watchForFileChanges: false, // Disable file watching for CI stability
});

export default config;
