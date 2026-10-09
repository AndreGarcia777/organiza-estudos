import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./integration",
  workers: 1,
  timeout: 60000,
  outputDir: "artifacts/auth-results",
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3100", channel: "msedge", screenshot: "off", trace: "off" },
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://127.0.0.1:3100/entrar",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
