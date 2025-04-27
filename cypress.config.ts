import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.{cy,spec}.ts",
    screenshotOnRunFailure: true,
    video: true,
    baseUrl: "http://localhost:3000",
  },
  component: {
    supportFile: "cypress/support/component.ts",
    indexHtmlFile: "cypress/support/component-index.html",
    specPattern: "cypress/component/**/*.{cy,spec}.tsx",
    screenshotOnRunFailure: true,
    video: true,
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
