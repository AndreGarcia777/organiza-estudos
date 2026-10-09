import { spawnSync } from "node:child_process";
import { localSupabase } from "./local-supabase.mjs";
try {
  const config = localSupabase();
  const env = {
    ...process.env,
    APP_MODE: "supabase",
    AUTH_EMAIL_FLOWS_ENABLED: "true",
    APP_URL: "http://127.0.0.1:3100",
    NEXT_PUBLIC_SUPABASE_URL: config.url,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: config.key,
    TEST_LOCAL_DATABASE_URL: config.databaseUrl,
    TEST_LOCAL_SERVICE_KEY: config.secret,
  };
  const build = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], { env, stdio: "inherit" });
  if (build.status !== 0) process.exit(build.status ?? 1);
  const tests = spawnSync(process.execPath, ["node_modules/@playwright/test/cli.js", "test", "--config=playwright.auth.config.ts", ...process.argv.slice(2)], { env, stdio: "inherit" });
  process.exitCode = tests.status ?? 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
