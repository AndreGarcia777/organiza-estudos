import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfig } from "@/lib/app-mode";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Referrer-Policy", "same-origin");
  const config = supabaseConfig();
  if (!config) return response;
  const client = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values, headers) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        response.headers.set("Cache-Control", "private, no-store, max-age=0");
        response.headers.set("Referrer-Policy", "same-origin");
      },
    },
  });
  await client.auth.getClaims();
  // Authorization is repeated with getUser() in each protected page/action and in RLS.
  return response;
}
export const config = {
  matcher: ["/conta/:path*", "/admin/:path*", "/entrar", "/cadastrar", "/recuperar-senha", "/redefinir-senha", "/auth/:path*", "/solicitar"],
};
