import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { AuthForm } from "@/components/auth-form";
import { safeNext } from "@/lib/auth/validation";
import { authEmailFlowsEnabled } from "@/lib/app-mode";
export const metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const next = safeNext(query.next);
  const emailFlows = authEmailFlowsEnabled();
  return <AuthShell title="Entre para continuar." description="Acesse seu perfil e, quando o atendimento estiver disponível, acompanhe suas solicitações.">
    {query.senha === "alterada" && <p role="status" className="demo-callout">Senha alterada. Entre com sua nova senha.</p>}
    {!emailFlows && <p className="demo-callout">Versão de avaliação: entre com uma conta previamente preparada pelo responsável. Cadastro e recuperação de senha por e-mail não estão disponíveis.</p>}
    {query.erro && <p role="alert" className="form-error">{emailFlows ? "Não foi possível confirmar o acesso. O link pode estar inválido ou expirado. Tente entrar ou solicite uma nova recuperação." : "Links de confirmação e recuperação estão desativados. Entre com os dados da conta de avaliação."}</p>}
    <AuthForm mode="login" next={next} />
    {emailFlows && <div className="auth-links"><Link href={`/cadastrar?next=${encodeURIComponent(next)}`}>Criar conta</Link><Link href="/recuperar-senha">Esqueci minha senha</Link></div>}
  </AuthShell>;
}
