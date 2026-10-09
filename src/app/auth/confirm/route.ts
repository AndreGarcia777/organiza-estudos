import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { appOrigin, appMode, authEmailFlowsEnabled } from "@/lib/app-mode";
import { safeNext } from "@/lib/auth/validation";

// For deployments with configurable email templates. Default emails use PKCE callback.
export async function GET(request: NextRequest) {
  const origin = appMode() === "supabase" ? appOrigin() : request.nextUrl.origin;
  const hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  let destination = "/entrar?erro=confirmacao";
  try {
    const client = authEmailFlowsEnabled() ? await createSupabaseServer() : null;
    if (client && hash && (type === "signup" || type === "recovery")) {
      const { error } = await client.auth.verifyOtp({ token_hash: hash, type: type as EmailOtpType });
      if (!error) destination = type === "recovery" ? "/redefinir-senha" : safeNext(request.nextUrl.searchParams.get("next"));
    }
  } catch { /* Never log token hashes. */ }
  const response = NextResponse.redirect(new URL(destination, origin));
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
