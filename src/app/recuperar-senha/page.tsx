import Link from "next/link";
import { redirect } from "next/navigation";
import { authEmailFlowsEnabled } from "@/lib/app-mode";
import { AuthShell } from "@/components/auth-shell";
import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Recuperar acesso" };
export const dynamic = "force-dynamic";
export default function RecoverPage() {
  if (!authEmailFlowsEnabled()) redirect("/entrar");
  return <AuthShell title="Vamos recuperar seu acesso." description="Informe o e-mail da sua conta para solicitar as instruções de recuperação.">
    <AuthForm mode="recover" /><div className="auth-links"><Link href="/entrar">Voltar para entrar</Link></div>
  </AuthShell>;
}
