import Link from "next/link";
import {requireAdmin} from "@/lib/admin";
import {ActionForm} from "@/components/action-form";
import {Field} from "@/components/fields";
export const metadata={title:"Oferta e atendimento"};
export default async function OfferAdmin(){
 const {client}=await requireAdmin();const {data:o,error}=await client.from("offer_settings").select("*").eq("id",true).single();if(error)throw new Error("Oferta indisponível.");
 return <section className="container inner-page"><Link className="back-link" href="/admin">← Administração</Link><h1>Oferta e atendimento</h1><p className="lead">Alterações valem para novos pedidos. O histórico de cada pedido preserva as condições aceitas.</p>
 <ActionForm operation="offer" label="Salvar oferta"><div className="form-grid">
 <Field name="price" label="Preço experimental em R$" type="number" required min={0} max={10000} step={0.01} value={o.price_cents/100}/>
 <Field name="offer_text" label="Descrição da oferta" required maxLength={500} value={o.offer_text}/>
 <Field name="delivery_text" label="Condições e prazo de atendimento (opcional)" area maxLength={500} value={o.delivery_text??""}/>
 <Field name="public_whatsapp" label="WhatsApp público do responsável, com DDI (opcional)" maxLength={15} pattern="[1-9][0-9]{7,14}" value={o.public_whatsapp??""}/>
 </div><label className="check"><input name="pilot_enabled" type="checkbox" defaultChecked={o.pilot_enabled}/>Permitir concessão de piloto gratuito</label>
 <label className="check"><input name="requests_enabled" type="checkbox" defaultChecked={o.requests_enabled}/>Abrir recebimento de pedidos</label>
 <p className="fine-print">O contato será público. O link apenas abre o WhatsApp; nenhuma mensagem é enviada automaticamente.</p></ActionForm></section>;
}
