import Link from "next/link";
import {notFound} from "next/navigation";
import {requireAdmin} from "@/lib/admin";
import {ActionForm} from "@/components/action-form";
import {Field,Select} from "@/components/fields";
import {uuid} from "@/lib/workflow";
export async function generateMetadata({params}:{params:Promise<{id:string}>}){return {title:(await params).id==="novo"?"Cadastrar material":"Editar material"};}
export default async function MaterialEditor({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const {client}=await requireAdmin();if(id!=="novo"&&!uuid(id))notFound();
 const {data:m,error}=id==="novo"?{data:null,error:null}:await client.from("materials").select("*").eq("id",id).maybeSingle();if(error)throw new Error("Material indisponível.");if(id!=="novo"&&!m)notFound();
 const {data:links}=m?await client.from("material_topics").select("topic_id").eq("material_id",id):{data:[]};
 const {data:topics}=links?.length?await client.from("topics").select("name").in("id",links.map(x=>x.topic_id)):{data:[]};
 return <section className="container inner-page"><Link className="back-link" href="/admin/materiais">← Materiais</Link><h1>{m?"Editar material":"Cadastrar material"}</h1><p className="lead">Registre apenas informações conferidas. Campos opcionais vazios aparecerão como não informados.</p>
 <ActionForm operation="material" label="Salvar material"><input type="hidden" name="id" value={m?.id??""}/><div className="form-grid">
 <Field name="title" label="Título" required minLength={2} maxLength={200} value={m?.title}/>
 <Field name="slug" label="Endereço no catálogo (letras minúsculas e hífens)" required maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={m?.slug}/>
 <Field name="author" label="Autor ou instituição" required maxLength={200} value={m?.author}/>
 <Field name="original_url" label="Endereço original (opcional)" type="url" maxLength={2048} value={m?.original_url??""}/>
 <Field name="topic_names" label="Tópicos separados por vírgula" required maxLength={1000} value={topics?.map(t=>t.name).join(", ")}/>
 <Select name="level" label="Nível" value={m?.level} options={{Iniciante:"Iniciante","Intermediário":"Intermediário","Avançado":"Avançado"}}/>
 <Field name="format" label="Formato" required minLength={2} maxLength={60} value={m?.format??"Artigo"}/>
 <Field name="language" label="Idioma" required minLength={2} maxLength={60} value={m?.language??"Português"}/>
 <Select name="access" label="Acesso" value={m?.access} options={{Gratuito:"Gratuito",Pago:"Pago","Parcialmente gratuito":"Parcialmente gratuito"}}/>
 <Field name="duration" label="Duração do conteúdo (opcional)" maxLength={100} value={m?.duration??""}/>
 <Field name="study_estimate" label="Estimativa de estudo (opcional)" maxLength={100} value={m?.study_estimate??""}/>
 <Field name="external_price" label="Preço externo em R$ (opcional)" type="number" min={0} max={10000} step={0.01} value={m?.external_price_cents==null?"":m.external_price_cents/100}/>
 <Field name="price_checked_at" label="Data de consulta do preço" type="date" value={m?.price_checked_at??""}/>
 <Field name="reviewed_at" label="Data da última revisão" type="date" value={m?.reviewed_at??""}/>
 {(["summary","coverage","limitations","prerequisites","curation"] as const).map((k,i)=><Field key={k} name={k} label={["Resumo","Cobertura","Limitações","Pré-requisitos","Comentário da curadoria"][i]} area required maxLength={k==="summary"?1000:k==="prerequisites"?2000:4000} value={m?.[k]}/>)}
 <Select name="status" label="Publicação" value={m?.status} options={{draft:"Rascunho",published:"Publicado",archived:"Arquivado"}}/>
 </div></ActionForm></section>;
}
