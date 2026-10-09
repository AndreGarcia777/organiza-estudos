import Link from "next/link";
import { redirect } from "next/navigation";
import { authEmailFlowsEnabled } from "@/lib/app-mode";
import { AuthShell } from "@/components/auth-shell";
import { AuthForm } from "@/components/auth-form";
import { safeNext } from "@/lib/auth/validation";
export const metadata = { title: "Criar conta" };
export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const next = safeNext((await searchParams).next);
  if (!authEmailFlowsEnabled()) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  return <AuthShell title="Seu próximo passo começa aqui." description="Crie uma conta com e-mail e senha. Seu e-mail não será publicado.">
    <AuthForm mode="signup" next={next} />
    <div className="auth-links"><Link href={`/entrar?next=${encodeURIComponent(next)}`}>Já tenho uma conta</Link></div>
  </AuthShell>;
}
