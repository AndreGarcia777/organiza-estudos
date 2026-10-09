import Link from "next/link";
import {states} from "@/lib/workflow";
import { AuthShell } from "@/components/auth-shell";
import { ProfileForm } from "@/components/profile-form";
import { requireUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/logout-button";
export const metadata = { title: "Minha conta" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const identity = await requireUser();
  if (!identity) return <AuthShell title="Minha conta" description="Seu espaço para acompanhar os estudos.">{null}</AuthShell>;
  const { client, user } = identity;
  const [{ data: profile, error: profileError }, { data: admin, error: roleError }, { data: requests, error: requestError }] = await Promise.all([
    client.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    client.rpc("is_admin"),
    client.from("study_requests").select("id,subject,state,created_at").eq("student_id", user.id).order("created_at", { ascending: false }).limit(50),
  ]);
  if (profileError || roleError || requestError) throw new Error("Não foi possível consultar os dados da conta.");
  const query = await searchParams;
  return <section className="container inner-page">
    <p className="eyebrow">ÁREA DO ESTUDANTE</p><h1>Minha conta</h1>
    <p className="lead">Seu e-mail de acesso: {user.email}. Ele não é publicado no catálogo.</p>
    {query.erro === "sair" && <p role="alert" className="form-error">Não foi possível encerrar a sessão. Tente novamente.</p>}
    <div className="account-grid">
      <section className="offer"><h2>Seu perfil</h2><ProfileForm displayName={profile?.display_name ?? "Estudante"} /></section>
      <section className="offer"><h2>Seus pedidos</h2>
        {requests?.length ? <ul className="request-list">{requests.map((request) => <li key={request.id}><Link className="text-link" href={"/conta/pedidos/"+request.id}>{request.subject}</Link><span>{states[request.state]}</span><span>Recebido em {new Date(request.created_at).toLocaleDateString("pt-BR")}</span></li>)}</ul> : <p>Você ainda não tem pedidos. Preencha sua necessidade para solicitar uma seleção.</p>}
        <Link className="text-link" href="/solicitar">Continuar preenchimento →</Link>
      </section>
    </div>
    <div className="actions">{admin && <Link className="button secondary" href="/admin">Área administrativa</Link>}<LogoutButton /></div>
  </section>;
}
