import { writeFile } from "node:fs/promises";
import { localSupabase } from "./local-supabase.mjs";

try {
  const config = localSupabase();
  const content = [
    "APP_MODE=supabase",
    "AUTH_EMAIL_FLOWS_ENABLED=true",
    "APP_URL=http://127.0.0.1:3000",
    `NEXT_PUBLIC_SUPABASE_URL=${config.url}`,
    `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${config.key}`,
    "",
  ].join("\n");
  await writeFile(".env.local", content, { flag: "wx" });
  console.log(".env.local criado com a URL e a chave pública locais. Reinicie o servidor.");
} catch (error) {
  console.error(error.code === "EEXIST" ? ".env.local já existe e foi preservado. Atualize-o manualmente." : error.message);
  process.exitCode = 1;
}
