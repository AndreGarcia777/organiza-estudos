"use client";
import {useState,useTransition,useSyncExternalStore, type ReactNode} from "react";
import {useRouter} from "next/navigation";
import {mutate} from "@/app/workflow-actions";
import type {Operation,Result} from "@/lib/workflow";
const subscribe=()=>()=>{};
export function ActionForm({operation,children,label="Salvar",className="demo-form"}:{operation:Operation;children:ReactNode;label?:string;className?:string}) {
 const ready=useSyncExternalStore(subscribe,()=>true,()=>false);
 const [result,setResult]=useState<Result>({}); const [pending,start]=useTransition(); const router=useRouter();
 return <form method="post" className={className} onSubmit={event=>{
  event.preventDefault(); setResult({}); const data=new FormData(event.currentTarget);
  start(async()=>{try {
   const next=await mutate(operation,data); setResult(next);
   if(next.error)return;
   if(operation==="request")try{sessionStorage.removeItem("guia-estudos:request-draft:v1");}catch{}
   if(next.href)router.push(next.href); else router.refresh();
  }catch{setResult({error:"Não foi possível conectar. Seus campos foram preservados; tente novamente."});}});
 }}>
 {children}<button className="button primary" disabled={pending||!ready}>{pending?"Salvando…":label}</button>
 {result.error&&<p role="alert" className="form-error">{result.error}</p>}
 {result.message&&<p role="status" className="demo-callout">{result.message}</p>}
 <noscript>Ative JavaScript para enviar este formulário.</noscript>
 </form>;
}
