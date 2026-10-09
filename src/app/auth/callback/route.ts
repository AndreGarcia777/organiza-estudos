import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { appOrigin, appMode, authEmailFlowsEnabled } from "@/lib/app-mode";
import { safeNext } from "@/lib/auth/validation";

export async function GET(request: NextRequest) {
  const configOrigin = appMode() === "supabase" ? appOrigin() : request.nextUrl.origin;
  const next = request.nextUrl.searchParams.get("next");
  const code = request.nextUrl.searchParams.get("code");
  let destination = "/entrar?erro=confirmacao";
  try {
    const client = authEmailFlowsEnabled() ? await createSupabaseServer() : null;
    if (client && code) {
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error) destination = next === "/redefinir-senha" ? next : safeNext(next);
    }
  } catch { /* Do not log codes, cookies or tokens. */ }
  const response = NextResponse.redirect(new URL(destination, configOrigin));
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
