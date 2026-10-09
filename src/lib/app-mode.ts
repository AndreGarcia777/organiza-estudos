// Email-based registration/recovery must be explicitly enabled for local tests.
// The academic deployment uses only accounts prepared by the responsible person.
export function authEmailFlowsEnabled(): boolean {
  return process.env.AUTH_EMAIL_FLOWS_ENABLED === "true";
}

export function appMode(): "demo" | "supabase" {
  const mode = process.env.APP_MODE ?? "demo";
  if (mode !== "demo" && mode !== "supabase") throw new Error("APP_MODE deve ser demo ou supabase.");
  return mode;
}

export function supabaseConfig() {
  if (appMode() !== "supabase") return null;
  appOrigin();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Configure a URL e a chave publicável do Supabase.");
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("URL do Supabase inválida.");
  if (key.startsWith("sb_secret_")) throw new Error("Use somente a chave publicável.");
  // A legacy service_role JWT must never be mistaken for a public key.
  if (key.split(".").length === 3) {
    const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString());
    if (payload.role !== "anon") throw new Error("Chave JWT não pública.");
  }
  return { url, key };
}

export function appOrigin() {
  const value = process.env.APP_URL;
  if (!value) throw new Error("Configure APP_URL antes de habilitar autenticação.");
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("APP_URL inválida.");
  return url.origin;
}
