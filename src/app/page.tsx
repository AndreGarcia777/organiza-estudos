import Link from "next/link";
import { getOffer } from "@/lib/catalog";
import { selectionPrice } from "@/config/site";

const steps = [
  ["01", "Conte o que precisa aprender", "Sua disciplina, os tópicos que geram dúvida e o tempo que você tem para estudar."],
  ["02", "Encontre opções com contexto", "Entenda o nível, os pré-requisitos e os limites de cada material antes de escolher."],
  ["03", "Estude e compartilhe", "Depois de usar o material, conte o que ajudou e o que poderia ser melhor."],
];

export default async function Home() {
  const offer = await getOffer();
  const price = offer ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(offer.price_cents / 100) : selectionPrice;
  return <>
    <section className="container hero">
      <div>
        <p className="eyebrow"><span className="small-line" /> SEU PRÓXIMO PASSO NOS ESTUDOS</p>
        <h1>Menos tempo procurando.<br /><span>Mais direção para aprender.</span></h1>
        <p className="lead">Entre tantos links, encontre um ponto de partida. Materiais de IA, matemática e programação com contexto para seu conhecimento e seu tempo.</p>
        <div className="actions"><Link className="button primary" href="/catalogo">Explorar materiais <span aria-hidden="true">↗</span></Link><Link className="button secondary" href="/solicitar">Solicitar seleção personalizada</Link></div>
        <p className="fine-print">Consulta ao catálogo gratuita. Curadoria personalizada opcional.</p>
      </div>
      <aside className="study-note" aria-labelledby="note-title">
        <div className="note-top"><span>UM BOM PONTO DE PARTIDA</span><span aria-hidden="true">✳</span></div>
        <h2 id="note-title">O material certo começa com as perguntas certas.</h2>
        <ul className="note-list"><li><span aria-hidden="true">01</span> O que preciso aprender?</li><li><span aria-hidden="true">02</span> O que já sei sobre o assunto?</li><li><span aria-hidden="true">03</span> Quanto tempo tenho?</li></ul>
        <p className="note-bottom">A escolha faz parte do aprendizado.</p>
      </aside>
    </section>
    <section className="process-section" aria-labelledby="como-funciona"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">COMO FUNCIONA</p><h2 id="como-funciona">Um caminho mais claro para estudar.</h2></div><p>Da dúvida à escolha, em três passos.</p></div>
      <ol className="steps">{steps.map(([number, title, description]) => <li key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{description}</p></li>)}</ol>
    </div></section>
    <section className="container offers" aria-labelledby="ofertas"><div className="section-heading"><div><p className="eyebrow">ESCOLHA SEU PONTO DE PARTIDA</p><h2 id="ofertas">Explore por conta própria.<br />Ou conte com uma seleção para você.</h2></div></div>
      <div className="offer-grid"><article className="offer"><span className="badge">CONSULTA GRATUITA</span><h3>Um catálogo para explorar</h3><p>Consulte materiais e conheça seus tópicos, formatos e pré-requisitos para decidir por onde começar.</p><Link className="text-link" href="/catalogo">Conhecer o catálogo <span aria-hidden="true">→</span></Link></article>
        <article className="offer featured"><span className="badge">CURADORIA PERSONALIZADA</span><h3>{offer?.offer_text??"Sua necessidade como guia"}</h3><p>Uma seleção feita manualmente pelo responsável, com justificativas relacionadas ao seu objetivo de estudo.</p><p className="price">{price} <span>por seleção · preço experimental</span></p><Link className="text-link" href="/solicitar">Entender a seleção personalizada <span aria-hidden="true">→</span></Link><p className="fine-print">Solicitar não efetua cobrança. Materiais pagos de outros fornecedores não estão incluídos.</p></article></div>
    </section>
  </>;
}
