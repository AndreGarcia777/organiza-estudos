"use client";
import {useEffect,useMemo,useRef,useState,useSyncExternalStore} from "react";
import {useRouter} from "next/navigation";
import {ActionForm} from "@/components/action-form";
import {Field,Select} from "@/components/fields";
import type {Database} from "@/lib/supabase/database.types";
const key="guia-estudos:request-draft:v1";
const fields=["subject","topics","objective","knowledge","prerequisites","hours","language","budget","deadline","tried_materials","notes","whatsapp","preferred_channel"] as const;
type Draft={owner:string|null;expires:number;values:Record<string,string>;formats:string[];free:boolean};
function subscribe(fn:()=>void){window.addEventListener("guia-draft",fn);return()=>window.removeEventListener("guia-draft",fn);}
function snapshot(){try{return sessionStorage.getItem(key);}catch{return null;}}
function parse(raw:string|null):Draft|null {try{const d=JSON.parse(raw??"null"); if(!d||d.expires<Date.now()||typeof d.values!=="object")return null; const values:Record<string,string>={};for(const k of fields)if(typeof d.values[k]==="string")values[k]=d.values[k].slice(0,2000);return {...d,values,formats:Array.isArray(d.formats)?d.formats:[],free:d.free!==false};}catch{return null;}}
export function RequestDraft({userId,email,offer,submissionKey}:{userId:string|null;email?:string;offer:Database["public"]["Tables"]["offer_settings"]["Row"];submissionKey:string}){
 const router=useRouter();const root=useRef<HTMLElement>(null);const raw=useSyncExternalStore(subscribe,snapshot,()=>null);const draft=useMemo(()=>parse(raw),[raw]);const active=draft&&(!draft.owner||draft.owner===userId)?draft:null;
 const [message,setMessage]=useState("");
 useEffect(()=>{if(!raw)return;try{if(!draft||(draft.owner&&draft.owner!==userId))sessionStorage.removeItem(key);else if(!draft.owner&&userId)sessionStorage.setItem(key,JSON.stringify({...draft,owner:userId}));else return;window.dispatchEvent(new Event("guia-draft"));}catch{}},[raw,draft,userId]);
 function save(){const form=root.current?.querySelector("form");if(!form)return;const data=new FormData(form);const values:Record<string,string>={};for(const name of fields)values[name]=String(data.get(name)??"").slice(0,2000);try{sessionStorage.setItem(key,JSON.stringify({owner:userId,expires:Date.now()+7200000,values,formats:data.getAll("formats"),free:data.get("free_only")==="on"}));window.dispatchEvent(new Event("guia-draft"));if(!userId)router.push("/entrar?next=/solicitar");else setMessage("Rascunho salvo nesta aba por até duas horas.");}catch{setMessage("Não foi possível guardar o rascunho. Copie suas anotações antes de sair.");}}
 const accepted={price_cents:offer.price_cents,offer_text:offer.offer_text,delivery_text:offer.delivery_text,pilot_enabled:offer.pilot_enabled,requests_enabled:offer.requests_enabled};
 return <section ref={root} className="demo-form-section"><h2 className="subheading">Sua necessidade de estudo</h2>
 <p className="demo-callout">Você pode guardar os campos nesta aba por até duas horas para continuar após entrar. Não inclua documentos ou dados sensíveis. O pedido só será registrado ao selecionar “Enviar pedido”.</p>
 <ActionForm key={raw??"empty"} operation="request" label="Enviar pedido">
 <input type="hidden" name="submission_key" value={submissionKey}/><input type="hidden" name="accepted_offer" value={JSON.stringify(accepted)}/>
 <div className="form-grid">
 <Field name="subject" label="Disciplina" required minLength={2} maxLength={150} value={active?.values.subject}/>
 <Field name="topics" label="Tópicos que precisa estudar" area required maxLength={2000} value={active?.values.topics}/>
 <Select name="objective" label="Objetivo" value={active?.values.objective} options={{prova:"Prova",trabalho:"Trabalho",compreensao:"Compreensão do assunto",outro:"Outro"}}/>
 <Select name="knowledge" label="Conhecimento prévio" value={active?.values.knowledge} options={{Iniciante:"Iniciante","Intermediário":"Intermediário","Avançado":"Avançado"}}/>
 <Field name="prerequisites" label="Pré-requisitos que já domina" required maxLength={2000} value={active?.values.prerequisites}/>
 <Field name="hours" label="Horas disponíveis" type="number" required min={0.25} max={1000} step={0.25} value={active?.values.hours}/>
 <Field name="deadline" label="Prazo (opcional)" type="date" value={active?.values.deadline}/>
 <Select name="language" label="Idioma preferido" value={active?.values.language} options={{"Português":"Português","Inglês":"Inglês","Espanhol":"Espanhol"}}/>
 <Field name="budget" label="Orçamento para materiais externos em R$ (opcional)" type="number" min={0} max={10000} step={0.01} value={active?.values.budget==="Somente gratuitos"?"":active?.values.budget}/>
 <Field name="tried_materials" label="Materiais já experimentados e o que não funcionou (opcional)" area maxLength={2000} value={active?.values.tried_materials}/>
 <Field name="notes" label="Observações (opcional)" area maxLength={2000} value={active?.values.notes}/>
 <Field name="whatsapp" label="WhatsApp com DDI, somente dígitos (opcional)" pattern="[1-9][0-9]{7,14}" maxLength={15} value={active?.values.whatsapp}/>
 <Select name="preferred_channel" label="Canal preferido" value={active?.values.preferred_channel} options={{email:"E-mail da conta",whatsapp:"WhatsApp"}}/>
 </div>
 <fieldset className="choice-list"><legend>Formatos preferidos (opcional)</legend>{["Artigo","Vídeo","Curso","Livro","Outro"].map(v=><label key={v}><input type="checkbox" name="formats" value={v} defaultChecked={active?.formats.includes(v)}/>{v}</label>)}</fieldset>
 <label className="check"><input type="checkbox" name="free_only" defaultChecked={active?.free??true}/>Somente materiais gratuitos (ignora orçamento informado)</label>
 <p className="fine-print">{email?"Contato por e-mail: "+email:"O e-mail será o da conta usada para entrar."} Ele será visível somente para você e a administração.</p>
 <div className="actions"><button type="button" className="button secondary" onClick={save}>{userId?"Guardar rascunho nesta aba":"Guardar rascunho e entrar"}</button><button type="button" className="text-link" onClick={()=>{try{sessionStorage.removeItem(key);window.dispatchEvent(new Event("guia-draft"));setMessage("Rascunho apagado.");}catch{}}}>Apagar rascunho</button></div>
 {message&&<p role="status">{message}</p>}
 {(!userId||!offer.requests_enabled)&&<p className="demo-callout">{!userId?"Entre para enviar o pedido.":"O responsável ainda não abriu o recebimento de pedidos."}</p>}
 <label className="check"><input name="consent" type="checkbox" required/>Li a oferta acima. O envio não efetua cobrança; o atendimento e eventual pagamento serão combinados manualmente.</label>
 </ActionForm></section>;
}
