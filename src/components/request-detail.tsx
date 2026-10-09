import Link from "next/link";
import {notFound} from "next/navigation";
import {requireUser} from "@/lib/auth/session";
import {requireAdmin} from "@/lib/admin";
import {ActionForm} from "@/components/action-form";
import {Field,Select} from "@/components/fields";
import {states,commercial,transitions,money,uuid} from "@/lib/workflow";
import type {Json} from "@/lib/supabase/database.types";
const record=(v:Json):Record<string,Json|undefined>=>v&&typeof v==="object"&&!Array.isArray(v)?v:{};
const display=(v:Json|undefined)=>typeof v==="string"||typeof v==="number"?String(v):"Não informado";
function external(v:Json|undefined){try{const u=new URL(String(v));return ["http:","https:"].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}}
export async function RequestDetail({id,administrator=false}:{id:string;administrator?:boolean}){
 if(!uuid(id))notFound();
 const identity=administrator?await requireAdmin():await requireUser();if(!identity)notFound();const {client,user}=identity;
 let query=client.from("study_requests").select("*").eq("id",id);if(!administrator)query=query.eq("student_id",user.id);
 const {data:r,error}=await query.maybeSingle();if(error)throw new Error("Pedido indisponível.");if(!r)notFound();
 const [{data:sets,error:se},{data:feedback,error:fe},{data:answers,error:ae},{data:offer}]=await Promise.all([
 client.from("recommendation_sets").select("*").eq("request_id",id).order("version",{ascending:false}),
 client.from("feedbacks").select("*").eq("request_id",id).order("created_at",{ascending:false}).limit(100),
 client.from("request_answers").select("*").eq("request_id",id).order("created_at",{ascending:false}).limit(100),
 client.from("offer_settings").select("public_whatsapp").eq("id",true).single()]);
 if(se||fe||ae)throw new Error("Histórico indisponível.");
 const {data:recs,error:re}=sets?.length?await client.from("recommendations").select("*").in("selection_id",sets.map(x=>x.id)).order("position"):{data:[],error:null};if(re)throw new Error("Seleções indisponíveis.");
 const draft=sets?.find(s=>s.status==="draft");const published=sets?.filter(s=>s.status==="published")??[];
 const options=recs?.filter(x=>x.selection_id===draft?.id)??[];
 const {data:materials,error:me}=administrator?await client.from("materials").select("id,title").eq("status","published").order("title").limit(1000):{data:[],error:null};if(me)throw new Error("Catálogo indisponível.");
 const accepted=record(r.offer_snapshot);
 return <section className="container inner-page workflow"><Link className="back-link" href={administrator?"/admin":"/conta"}>← {administrator?"Administração":"Minha conta"}</Link>
 <p className="eyebrow">PEDIDO REGISTRADO</p><h1>{r.subject}</h1><p className="lead">{states[r.state]} · Recebido em {new Date(r.created_at).toLocaleDateString("pt-BR")}</p>
 <div className="account-grid"><article className="offer"><h2>Necessidade de estudo</h2><dl className="facts">
 {Object.entries({"Tópicos":r.topics,"Objetivo":{prova:"Prova",trabalho:"Trabalho",compreensao:"Compreensão do assunto",outro:"Outro"}[r.objective]??r.objective,"Conhecimento":r.knowledge_level,"Pré-requisitos dominados":r.prerequisites,"Prazo":r.deadline??"Não informado","Horas disponíveis":String(r.study_hours),"Formatos":r.formats.join(", ")||"Sem preferência","Idiomas":r.languages.join(", "),"Materiais externos":r.free_only?"Somente gratuitos":money(r.external_budget_cents),"Já experimentou":r.tried_materials??"Não informado","Observações":r.notes??"Não informado","Contato":r.preferred_channel==="email"?r.contact_email:r.whatsapp??r.contact_email}).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
 </dl></article><article className="offer"><h2>Oferta aceita no envio</h2><p>{display(accepted.offer_text)}</p><p>{money(typeof accepted.price_cents==="number"?accepted.price_cents:null)} por seleção</p><p>{typeof accepted.delivery_text==="string"?accepted.delivery_text:"Prazo a combinar com o responsável."}</p><p>{accepted.pilot_enabled?"Benefício de piloto poderia ser concedido pelo responsável.":"Oferta sem benefício de piloto anunciado."}</p>
 <h3>Condição combinada</h3><p>{commercial[r.commercial_status]} · {money(r.agreed_price_cents)}</p><p className="fine-print">Registro manual. A aplicação não verifica pagamentos. Concluir o atendimento não confirma pagamento.</p>
 {offer?.public_whatsapp&&<a className="button secondary" href={"https://wa.me/"+offer.public_whatsapp} target="_blank" rel="noopener noreferrer">Abrir WhatsApp do responsável ↗</a>}
 </article></div>
 {r.information_prompt&&<section className="offer"><h2>Informações solicitadas</h2><p>{r.information_prompt}</p>{!administrator&&r.state==="awaiting_information"&&<ActionForm operation="answer" label="Enviar informações"><input type="hidden" name="request_id" value={id}/><Field id="answer-message" name="message" label="Sua resposta" area required minLength={2} maxLength={2000}/></ActionForm>}
 {answers?.map(a=><article className="review" key={a.id}><strong>Pergunta: {a.question}</strong><p>{a.message}</p><p className="fine-print">{new Date(a.created_at).toLocaleString("pt-BR")}</p></article>)}</section>}
 {administrator&&<section className="offer"><h2>Atendimento e condições comerciais</h2><ActionForm operation="manage" label="Atualizar atendimento"><input type="hidden" name="request_id" value={id}/><input type="hidden" name="previous_state" value={r.state}/>
 <div className="form-grid"><Select name="state" label="Estado do atendimento" value={r.state} options={Object.fromEntries([r.state,...transitions[r.state]].map(k=>[k,states[k]]))}/>
 <Select name="commercial_status" label="Situação comercial (registro manual)" value={r.commercial_status} options={commercial}/>
 <Field name="agreed_price" label="Valor combinado em R$ (zero para piloto)" type="number" min={0} max={10000} step={0.01} value={r.agreed_price_cents==null?"":r.agreed_price_cents/100}/>
 <Field name="curator_minutes" label="Tempo total de atendimento em minutos" type="number" min={0} max={100000} step={1} required value={r.curator_minutes}/>
 <Field name="information_prompt" label="Informações necessárias do estudante (ao aguardar informações)" area maxLength={2000} value={r.information_prompt??""}/></div></ActionForm></section>}
 {administrator&&["in_review","awaiting_information","adjustment_requested"].includes(r.state)&&<section className="offer"><h2>Rascunho da seleção</h2><p>Prefira duas ou três opções pertinentes. Justifique se houver apenas uma; se nenhuma servir, comunique o motivo.</p>
 <ActionForm operation="selection" label="Salvar rascunho"><input type="hidden" name="request_id" value={id}/>
 {[1,2,3].map((n)=><fieldset key={n} className="selection-option"><legend>Opção {n}</legend><Select name={"material_"+n} label={"Material "+n} value={options[n-1]?.material_id??""} options={{"":"Sem opção",...Object.fromEntries(materials?.map(m=>[m.id,m.title])??[])}}/>
 {(["rationale","covered_topics","limitations","prerequisites","prioritize"] as const).map((k,i)=><Field key={k} name={k+"_"+n} label={["Por que este material","Tópicos cobertos","Limitações da opção","Pré-requisitos da opção","Partes a priorizar"][i]+" "+n} area maxLength={k==="rationale"?4000:2000} value={options[n-1]?.[k]}/>)}</fieldset>)}
 <Field name="single_reason" label="Justificativa para uma única opção" area maxLength={2000} value={draft?.single_option_reason??""}/>
 <Field name="missing_reason" label="Motivo de não haver materiais adequados (somente sem opções)" area maxLength={2000} value={draft?.no_suitable_material_reason??""}/>
 </ActionForm>{draft&&r.state==="in_review"&&<ActionForm operation="publish" label="Publicar seleção salva"><input type="hidden" name="selection_id" value={draft.id}/><p>Publica o último rascunho salvo. Salve as alterações acima antes de publicar.</p></ActionForm>}</section>}
 <section className="offer"><h2>Seleções publicadas</h2>{!published.length&&<p>A seleção ainda está em preparação. Os rascunhos são privados da administração.</p>}
 {published.map((s,index)=><article className="published-selection" key={s.id}><h3>Seleção {s.version}{index===0?" · Mais recente":""}</h3><p className="fine-print">Publicada em {new Date(s.published_at!).toLocaleString("pt-BR")}. Retrato dos materiais na preparação desta versão.</p>{s.no_suitable_material_reason&&<p>{s.no_suitable_material_reason}</p>}{s.single_option_reason&&<p>Uma opção: {s.single_option_reason}</p>}
 {recs?.filter(x=>x.selection_id===s.id).map(rec=>{const m=record(rec.material_snapshot);const url=external(m.original_url);return <article className="recommendation" key={rec.id}><h3>{rec.position}. {display(m.title)}</h3><p>{display(m.author)} · {display(m.access)} · {display(m.language)}</p><dl className="facts">{Object.entries({"Por que foi escolhido":rec.rationale,"Tópicos cobertos":rec.covered_topics,"Limitações":rec.limitations,"Pré-requisitos":rec.prerequisites,"Priorize":rec.prioritize}).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>{url?<a className="text-link" href={url} target="_blank" rel="noopener noreferrer">Abrir material no site original ↗</a>:<p>Endereço não informado.</p>}</article>;})}</article>)}</section>
 {!administrator&&["selection_available","completed"].includes(r.state)&&<section className="offer"><h2>Conte como foi o estudo</h2><ActionForm operation="feedback" label="Registrar uso e feedback"><input type="hidden" name="request_id" value={id}/><input type="hidden" name="kind" value="usage"/>
 <Select name="recommendation_id" label="Material utilizado" options={{"":"Não utilizei um material",...Object.fromEntries(recs?.map(x=>[x.id,display(record(x.material_snapshot).title)])??[])}}/>
 <Select name="used_material" label="Você utilizou o material?" options={{no:"Ainda não",yes:"Sim"}}/>
 <Select name="met_objective" label="Serviu ao seu objetivo? (se utilizou)" options={{yes:"Sim",no:"Não"}}/>
 <Field name="search_effort" label="Como foi o esforço de busca?" area required maxLength={1000}/>
 <Field id="usage-message" name="message" label="Sua experiência" area required minLength={2} maxLength={2000}/></ActionForm>
 {r.state==="selection_available"&&<ActionForm operation="feedback" label="Solicitar ajuste"><input type="hidden" name="request_id" value={id}/><input type="hidden" name="kind" value="adjustment"/><Field id="adjustment-message" name="message" label="O que precisa mudar na seleção?" area required minLength={2} maxLength={2000}/><p className="fine-print">A seleção atual continuará disponível enquanto o ajuste é preparado.</p></ActionForm>}</section>}
 <section className="offer"><h2>Feedback e ajustes</h2>{feedback?.length?feedback.map(f=><article className="review" key={f.id}><strong>{f.kind==="usage"?"Experiência de uso autodeclarada":"Pedido de ajuste"}</strong><p>{f.message}</p>{f.kind==="usage"&&<p>Utilizou: {f.used_material?"sim":"não"} · Objetivo atendido: {f.met_objective===null?"não informado":f.met_objective?"sim":"não"} · Busca: {f.search_effort}</p>}<p className="fine-print">{new Date(f.created_at).toLocaleString("pt-BR")}</p></article>):<p>Nenhum feedback registrado.</p>}</section>
 </section>;
}
