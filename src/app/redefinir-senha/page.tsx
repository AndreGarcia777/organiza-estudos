import { AuthShell } from "@/components/auth-shell";
import { AuthForm } from "@/components/auth-form";
import { appMode, authEmailFlowsEnabled } from "@/lib/app-mode";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
export const metadata = { title: "Redefinir senha" };
export const dynamic = "force-dynamic";
export default async function ResetPage() {
  if (!authEmailFlowsEnabled()) redirect("/entrar");
  if (appMode() === "supabase") await requireUser();
  return <AuthShell title="Escolha uma nova senha." description="Após a alteração, entre novamente para continuar."><AuthForm mode="reset" /></AuthShell>;
}
