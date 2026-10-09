import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "email-disabled.spec.ts",
  outputDir: "artifacts/email-disabled-results",
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3101", channel: "msedge", screenshot: "off", trace: "off" },
  webServer: {
    command: "npm run start -- --port 3101",
    env: {
      APP_MODE: "supabase",
      APP_URL: "http://127.0.0.1:3101",
      AUTH_EMAIL_FLOWS_ENABLED: "false",
      // No real Supabase is used. Reaching this endpoint would be a test failure.
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:9",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_only",
    },
    url: "http://127.0.0.1:3101/entrar",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
