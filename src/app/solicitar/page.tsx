import {randomUUID} from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { DemoRequestForm } from "@/components/demo-request-form";
import { selectionPrice } from "@/config/site";

import { appMode } from "@/lib/app-mode";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getOffer } from "@/lib/catalog";
import { RequestDraft } from "@/components/request-draft";

export const metadata: Metadata = { title: "Seleção personalizada" };

export default async function RequestPage() {
  const demo = appMode() === "demo";
  const client = await createSupabaseServer();
  const user = client ? (await client.auth.getUser()).data.user : null;
  const offer = await getOffer();
  const price = offer ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(offer.price_cents / 100) : selectionPrice;
  return (
    <section className="container inner-page">
      <p className="eyebrow">APRENDER COM UM PONTO DE PARTIDA</p>
      <h1>Uma seleção que considera seu contexto.</h1>
      <p className="lead">A proposta é entender sua disciplina, seu objetivo e seu tempo para indicar materiais com justificativas claras.</p>
      <div className="request-grid">
        <article className="offer">
          <span className="badge">OFERTA EXPERIMENTAL</span>
          <h2>{offer?.offer_text??"Curadoria por demanda"}</h2>
          <p className="price">{price}<span> por seleção</span></p>
          <ul className="detail-list">
            <li>Atendimento e seleção feitos manualmente.</li>
            <li>Opções de acordo com seu nível e orçamento para materiais.</li>
            <li>Justificativas, pré-requisitos e limitações de cada opção.</li>
          </ul>
          <p className="fine-print">Não é uma assinatura. O envio de um pedido não efetua cobrança. Eventual pagamento será combinado com o responsável fora da aplicação. A seleção não compra acesso a materiais de terceiros.</p>
          {(!offer||offer.pilot_enabled)&&<p className="fine-print">No piloto, alguns pedidos poderão receber um benefício experimental gratuito, concedido pelo responsável.</p>}<p>{offer?.delivery_text??"Prazo a combinar com o responsável."}</p>
        </article>
        <div className="empty-state request-state">
          <span className="badge">{offer?.requests_enabled?"ATENDIMENTO MANUAL":"PEDIDOS REAIS EM PREPARAÇÃO"}</span>
          <h2>{offer?.requests_enabled?"Envie seu pedido e acompanhe pela sua conta.":"As solicitações ainda não estão abertas."}</h2>
          <p>{demo ? "Você pode experimentar o formulário abaixo com opções fictícias. O envio real dependerá de autenticação e acompanhamento dos pedidos." : "Preencha os campos abaixo. O pedido depende de análise manual e não efetua cobrança. Você poderá acompanhar as atualizações na sua conta."}</p>
          <Link className="button secondary" href="/catalogo">{demo ? "Explorar o catálogo demonstrativo" : "Explorar o catálogo"}</Link>
        </div>
      </div>
      {demo ? <DemoRequestForm /> : offer && <RequestDraft userId={user?.id ?? null} email={user?.email} offer={offer} submissionKey={randomUUID()} />}
    </section>
  );
}
