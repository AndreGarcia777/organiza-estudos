import { execFileSync } from "node:child_process";

export function localSupabase() {
  let data;
  try {
    data = JSON.parse(execFileSync(process.execPath, ["node_modules/supabase/dist/supabase.js", "status", "-o", "json"], { encoding: "utf8", timeout: 20000, stdio: ["ignore", "pipe", "pipe"] }));
  } catch {
    throw new Error("Supabase local indisponível. Inicie o Docker e execute npm run db:start. Nenhuma credencial foi exibida.");
  }
  const url = data.API_URL;
  const key = data.PUBLISHABLE_KEY || data.ANON_KEY;
  const secret = data.SECRET_KEY || data.SERVICE_ROLE_KEY;
  const databaseUrl = data.DB_URL;
  if (!url || !key || !secret || !databaseUrl) throw new Error("Status local incompleto. Confira a configuração da CLI sem compartilhar suas chaves.");
  for (const address of [url, databaseUrl]) {
    if (!["127.0.0.1", "localhost", "::1", "[::1]"].includes(new URL(address).hostname)) {
      throw new Error("Esta ferramenta aceita apenas serviços locais.");
    }
  }
  return { url, key, secret, databaseUrl };
}
