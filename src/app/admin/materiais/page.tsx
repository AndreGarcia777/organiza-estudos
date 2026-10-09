import Link from "next/link";
import {requireAdmin} from "@/lib/admin";
export const metadata={title:"Materiais"};
export default async function MaterialsAdmin(){
 const {client}=await requireAdmin(); const {data,error}=await client.from("materials").select("id,title,status").order("created_at",{ascending:false}).limit(200);if(error)throw new Error("Materiais indisponíveis.");
 return <section className="container inner-page"><Link className="back-link" href="/admin">← Administração</Link><h1>Materiais</h1><div className="actions"><Link className="button primary" href="/admin/materiais/novo">Cadastrar material</Link></div><ul className="request-list">{data.map(m=><li key={m.id}><Link className="text-link" href={"/admin/materiais/"+m.id}>{m.title}</Link><span>{{draft:"Rascunho",published:"Publicado",archived:"Arquivado"}[m.status]??m.status}</span></li>)}</ul>{!data.length&&<p>Nenhum material cadastrado.</p>}<p className="fine-print">Até 200 cadastros mais recentes.</p></section>;
}
