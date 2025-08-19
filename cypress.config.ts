import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:3000",
    downloadsFolder: "cypress/downloads",
    fixturesFolder: "cypress/fixtures",
    retries: {
      openMode: 0,
      runMode: 1,
    },
    screenshotsFolder: "cypress/screenshots",
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    videosFolder: "cypress/videos",
    viewportHeight: 800,
    viewportWidth: 1280,
  },
  video: false,
});
