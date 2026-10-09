import Link from "next/link";
import {AuthShell} from "@/components/auth-shell";
import {requireUser} from "@/lib/auth/session";
import {states} from "@/lib/workflow";
export const metadata={title:"Administração"};
export default async function AdminPage({searchParams}:{searchParams:Promise<{state?:string}>}){
 const identity=await requireUser("/admin");if(!identity)return <AuthShell title="Administração" description="Área restrita aos responsáveis pela curadoria.">{null}</AuthShell>;
 const {data:admin,error}=await identity.client.rpc("is_admin");if(error)throw new Error("Não foi possível verificar a permissão administrativa.");
 if(!admin)return <section className="container inner-page"><h1>Esta área é exclusiva da administração.</h1><Link href="/conta">Voltar à minha conta</Link></section>;
 const {state}=await searchParams;let query=identity.client.from("study_requests").select("id,subject,state,created_at").order("created_at",{ascending:false}).limit(100);if(state&&states[state])query=query.eq("state",state);
 const {data:requests,error:requestError}=await query;if(requestError)throw new Error("Pedidos indisponíveis.");
 return <section className="container inner-page"><p className="eyebrow">ADMINISTRAÇÃO</p><h1>Acesso administrativo verificado.</h1>
 <div className="actions"><Link className="button secondary" href="/admin/materiais">Gerenciar materiais</Link><Link className="button secondary" href="/admin/oferta">Oferta e atendimento</Link><Link className="button secondary" href="/admin/avaliacoes">Moderar avaliações</Link><Link className="button secondary" href="/admin/indicadores">Ver indicadores</Link><Link className="text-link" href="/conta">Minha conta</Link></div>
 <h2 className="subheading">Pedidos</h2><form className="filter-actions" action="/admin"><div className="field"><label htmlFor="filter-state">Estado</label><select id="filter-state" name="state" defaultValue={state??""}><option value="">Todos</option>{Object.entries(states).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div><button className="button secondary">Filtrar pedidos</button></form>
 <ul className="request-list">{requests.map(r=><li key={r.id}><Link className="text-link" href={"/admin/pedidos/"+r.id}>{r.subject}</Link><span>{states[r.state]} · {new Date(r.created_at).toLocaleDateString("pt-BR")}</span></li>)}</ul>{!requests.length&&<p>Nenhum pedido neste filtro.</p>}<p className="fine-print">Até 100 pedidos mais recentes por filtro.</p></section>;
}
