import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testIgnore: "email-disabled.spec.ts",
  outputDir: "artifacts/test-results",
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3100", channel: "msedge" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "celular", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: "npm run start -- --port 3100",
    env: { APP_MODE: "demo", APP_URL: "http://127.0.0.1:3100", AUTH_EMAIL_FLOWS_ENABLED: "false" },
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
