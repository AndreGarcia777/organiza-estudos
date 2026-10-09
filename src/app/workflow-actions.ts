"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import { uuid, type Operation, type Result, states, commercial } from "@/lib/workflow";

function text(f:FormData,k:string,min=0,max=2000) { const v=String(f.get(k)??"").trim(); if(v.length<min||v.length>max) throw new Error("Confira o campo: "+k+"."); return v; }
function choice(f:FormData,k:string,options:string[]) { const v=text(f,k,1,100); if(!options.includes(v)) throw new Error("Escolha uma opção válida em "+k+"."); return v; }
function number(f:FormData,k:string,min:number,max:number,optional=false) { const v=text(f,k); if(!v&&optional)return null; const n=Number(v.replace(",",".")); if(!v||!Number.isFinite(n)||n<min||n>max)throw new Error("Confira o valor de "+k+"."); return n; }
function cents(f:FormData,k:string,optional=true) { const n=number(f,k,0,10000,optional); return n===null?null:Math.round(n*100); }
function date(f:FormData,k:string) { const v=text(f,k,0,10); if(v&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||new Date(v).toISOString().slice(0,10)!==v))throw new Error("Confira a data."); return v||null; }
function id(f:FormData,k:string) { const v=text(f,k,1,36); if(!uuid(v))throw new Error("Identificador inválido."); return v; }
function link(f:FormData,k:string) { const v=text(f,k,0,2048); if(v) { let u; try {u=new URL(v);}catch{throw new Error("Informe um endereço completo HTTP ou HTTPS.");} if(!["http:","https:"].includes(u.protocol)||u.username||u.password)throw new Error("Informe um endereço HTTP ou HTTPS sem credenciais."); } return v||null; }
function dbMessage(code?:string,message?:string) {
 if(message?.includes("Offer changed"))return "A oferta mudou. Recarregue a página, revise as condições e tente novamente.";
 if(message?.includes("Requests are closed"))return "O recebimento de pedidos está fechado.";
 if(message?.includes("Daily"))return "Limite diário atingido. Tente novamente amanhã.";
 if(message?.includes("single option"))return "Explique por que apenas uma opção é adequada.";
 if(message?.includes("missing materials"))return "Informe por que não há material adequado.";
 if(code==="23505")return "Já existe um registro com esses dados. Confira o endereço do material ou recarregue a página.";
 if(code==="42501")return "Sua conta não tem permissão para realizar esta operação.";
 return "Não foi possível salvar. Confira os campos e o estado atual do pedido, recarregue e tente novamente.";
}
export async function mutate(operation:Operation, form:FormData):Promise<Result> {
 const client=await createSupabaseServer();
 if(!client)return {error:"Operação indisponível na demonstração."};
 const {data:{user}}=await client.auth.getUser();
 if(!user)return {error:"Sua sessão terminou. Entre novamente antes de enviar."};
 if(["material","offer","manage","selection","publish","moderate_review"].includes(operation)) {
  const role=await client.rpc("is_admin"); if(role.error||!role.data)return {error:"Acesso restrito à administração."};
 }
 try {
  let error:{code?:string;message?:string}|null=null; let href:string|undefined;
  if(operation==="request") {
   if(form.get("consent")!=="on")throw new Error("Confirme que leu as condições da oferta.");
   const free=form.get("free_only")==="on";
   const formats=form.getAll("formats").map(String);
   if(formats.some(x=>!["Artigo","Vídeo","Curso","Livro","Outro"].includes(x)))throw new Error("Formato inválido.");
   const whatsapp=text(form,"whatsapp",0,15)||null;
   if(whatsapp&&!/^[1-9][0-9]{7,14}$/.test(whatsapp))throw new Error("WhatsApp deve conter DDI, DDD e número, somente dígitos.");
   const channel=choice(form,"preferred_channel",["email","whatsapp"]);
   if(channel==="whatsapp"&&!whatsapp)throw new Error("Informe o WhatsApp para usar esse canal.");
   const deadline=date(form,"deadline"); if(deadline&&deadline<new Date().toISOString().slice(0,10))throw new Error("O prazo não pode estar no passado.");
   const payload={subject:text(form,"subject",2,150),topics:text(form,"topics",2),objective:choice(form,"objective",["prova","trabalho","compreensao","outro"]),knowledge_level:choice(form,"knowledge",["Iniciante","Intermediário","Avançado"]),prerequisites:text(form,"prerequisites",1),deadline,study_hours:number(form,"hours",0.25,1000),formats,languages:[choice(form,"language",["Português","Inglês","Espanhol"])],free_only:free,external_budget_cents:free?0:cents(form,"budget"),tried_materials:text(form,"tried_materials")||null,notes:text(form,"notes")||null,whatsapp,preferred_channel:channel};
   const accepted=JSON.parse(text(form,"accepted_offer",2,4000)) as Json;
   const result=await client.rpc("submit_request",{payload,submission:id(form,"submission_key"),accepted_offer:accepted});
   error=result.error; if(result.data)href="/conta/pedidos/"+result.data;
  } else if(operation==="offer") {
   const phone=text(form,"public_whatsapp",0,15)||null;
   if(phone&&!/^[1-9][0-9]{7,14}$/.test(phone))throw new Error("Contato inválido: use somente dígitos, com DDI.");
   ({error}=await client.from("offer_settings").update({price_cents:cents(form,"price",false)!,offer_text:text(form,"offer_text",1,500),delivery_text:text(form,"delivery_text",0,500)||null,public_whatsapp:phone,pilot_enabled:form.get("pilot_enabled")==="on",requests_enabled:form.get("requests_enabled")==="on"}).eq("id",true));
  } else if(operation==="material") {
   const materialId=text(form,"id",0,36); if(materialId&&!uuid(materialId))throw new Error("Material inválido.");
   const slug=text(form,"slug",2,120); if(!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))throw new Error("O endereço deve usar letras minúsculas, números e hífens.");
   const price=cents(form,"external_price"); const checked=date(form,"price_checked_at");
   if(price!==null&&!checked)throw new Error("Informe a data de consulta do preço externo.");
   const payload={id:materialId||null,slug,title:text(form,"title",2,200),author:text(form,"author",2,200),original_url:link(form,"original_url"),summary:text(form,"summary",1,1000),coverage:text(form,"coverage",1,4000),limitations:text(form,"limitations",1,4000),prerequisites:text(form,"prerequisites",1,2000),level:choice(form,"level",["Iniciante","Intermediário","Avançado"]),format:text(form,"format",2,60),language:text(form,"language",2,60),access:choice(form,"access",["Gratuito","Pago","Parcialmente gratuito"]),duration:text(form,"duration",0,100)||null,study_estimate:text(form,"study_estimate",0,100)||null,external_price_cents:price,price_checked_at:checked,reviewed_at:date(form,"reviewed_at"),curation:text(form,"curation",1,4000),status:choice(form,"status",["draft","published","archived"])};
   const topics=text(form,"topic_names",2,1000).split(",").map(x=>x.trim()).filter(Boolean);
   if(topics.length>10||topics.some(x=>x.length<2||x.length>100))throw new Error("Informe de 1 a 10 tópicos, com 2 a 100 caracteres cada.");
   const result=await client.rpc("save_material",{payload,topic_names:topics}); error=result.error;
   if(result.data)href="/admin/materiais/"+result.data;
  } else if(operation==="manage") {
   const requestId=id(form,"request_id");
   const status=choice(form,"state",Object.keys(states));
   const price=cents(form,"agreed_price"); const commercialStatus=choice(form,"commercial_status",Object.keys(commercial));
   const minutes=number(form,"curator_minutes",0,100000)!;
   if(!Number.isInteger(minutes))throw new Error("Informe minutos inteiros.");
   const question=text(form,"information_prompt",0,2000)||null;
   if(status==="awaiting_information"&&(!question||question.length<5))throw new Error("Explique quais informações o estudante precisa complementar.");
   const result=await client.from("study_requests").update({state:status,commercial_status:commercialStatus,agreed_price_cents:price,curator_minutes:minutes,information_prompt:question}).eq("id",requestId).eq("state",text(form,"previous_state",1,40)).select("id");
   error=result.error; if(!error&&!result.data?.length)throw new Error("O pedido mudou. Recarregue antes de salvar.");
  } else if(operation==="selection") {
   const options:Json[]=[];
   for(let i=1;i<=3;i++) {
    const material=text(form,"material_"+i,0,36); if(!material)continue;
    if(!uuid(material))throw new Error("Material inválido.");
    options.push({material_id:material,rationale:text(form,"rationale_"+i,5,4000),covered_topics:text(form,"covered_topics_"+i,1,2000),limitations:text(form,"limitations_"+i,1,2000),prerequisites:text(form,"prerequisites_"+i,1,2000),prioritize:text(form,"prioritize_"+i,1,2000)});
   }
   const result=await client.rpc("save_selection",{request:id(form,"request_id"),options,missing_reason:text(form,"missing_reason",0,2000),single_reason:text(form,"single_reason",0,2000)});
   error=result.error;
  } else if(operation==="publish") {
   ({error}=await client.rpc("publish_selection",{selection:id(form,"selection_id")}));
  } else if(operation==="feedback") {
   const kind=choice(form,"kind",["usage","adjustment"]);
   const recommendation=text(form,"recommendation_id",0,36)||null;
   if(recommendation&&!uuid(recommendation))throw new Error("Opção inválida.");
   const used=kind==="usage"?choice(form,"used_material",["yes","no"])==="yes":null;
   const met=kind==="usage"&&used?choice(form,"met_objective",["yes","no"])==="yes":null;
   if(used&&!recommendation)throw new Error("Escolha o material que utilizou.");
   ({error}=await client.from("feedbacks").insert({request_id:id(form,"request_id"),kind,recommendation_id:recommendation,used_material:used,met_objective:met,search_effort:text(form,"search_effort",kind==="usage"?1:0,1000)||null,message:text(form,"message",2,2000)}));
  } else if(operation==="answer") {
   ({error}=await client.from("request_answers").insert({request_id:id(form,"request_id"),message:text(form,"message",2,2000)}));
  } else if(operation==="review") {
   if(form.get("used_material")!=="on")throw new Error("Confirme que utilizou o material antes de avaliar.");
   const materialId=id(form,"material_id");
   const payload={display_name:text(form,"display_name",2,60),used_material:true,subject:text(form,"subject",2,150),topics:text(form,"topics",2,1000),study_context:text(form,"study_context",2,1000),institution:text(form,"institution",0,150)||null,positives:text(form,"positives",2,2000),limitations:text(form,"limitations",2,2000),recommends:choice(form,"recommends",["yes","no"])==="yes"};
   const current=await client.from("reviews").select("id").eq("author_id",user.id).eq("material_id",materialId).maybeSingle();
   if(current.error){error=current.error;}
   else if(current.data){({error}=await client.from("reviews").update(payload).eq("id",current.data.id).eq("author_id",user.id));}
   else {({error}=await client.from("reviews").insert({material_id:materialId,...payload}));}
  } else if(operation==="moderate_review") {
   const status=choice(form,"status",["approved","rejected"]);
   const result=await client.from("reviews").update({status}).eq("id",id(form,"review_id")).select("id");
   error=result.error; if(!error&&!result.data?.length)throw new Error("A avaliação não foi encontrada. Recarregue a página.");
  } else return {error:"Operação desconhecida."};
  if(error)return {error:dbMessage(error.code,error.message)};
  revalidatePath("/", "layout");
  return {message:operation==="publish"?"Seleção publicada.":operation==="review"?"Avaliação enviada para moderação.":operation==="moderate_review"?"Decisão de moderação salva.":"Dados salvos.",href};
 } catch(error) { return {error:error instanceof Error && !(error instanceof SyntaxError) ? error.message : "Confira os dados e tente novamente."}; }
}
