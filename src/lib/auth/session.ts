import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { safeNext } from "./validation";

export async function requireUser(next = "/conta") {
  const client = await createSupabaseServer();
  if (!client) return null;
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect(`/entrar?next=${encodeURIComponent(safeNext(next))}`);
  return { client, user };
}
