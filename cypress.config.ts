import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    screenshotOnRunFailure: true,
    video: true,
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e/e2e.ts",
  },
  component: {
    screenshotOnRunFailure: true,
    video: true,
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    indexHtmlFile: "cypress/support/component/component-index.html",
    supportFile: "cypress/support/component/component.ts",
  },
});
