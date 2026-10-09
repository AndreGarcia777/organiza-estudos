import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { demoDisclaimer, safeExternalUrl } from "@/data/demo-materials";
import { getCatalog, getPublicReviews } from "@/lib/catalog";
import { createSupabaseServer } from "@/lib/supabase/server";
import { CatalogEvent } from "@/components/catalog-event";
import { ReviewForm } from "@/components/review-form";
import type { Database } from "@/lib/supabase/database.types";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const material = (await getCatalog()).find((item) => item.slug === slug);
  return { title: material ? `${material.title}${material.isDemo ? " — exemplo" : ""}` : "Material não encontrado" };
}

export default async function MaterialPage({ params }: Props) {
  const { slug } = await params;
  const material = (await getCatalog()).find((item) => item.slug === slug);
  if (!material) notFound();
  let ownReview: Database["public"]["Tables"]["reviews"]["Row"] | null = null;
  let displayName = "Estudante";
  let userId: string | null = null;
  if (!material.isDemo && material.id) {
    const client = await createSupabaseServer();
    if (client) {
      const { data: { user } } = await client.auth.getUser();
      userId = user?.id ?? null;
      if (user) {
        const [{ data: review, error: reviewError }, { data: profile, error: profileError }] = await Promise.all([
          client.from("reviews").select("*").eq("author_id", user.id).eq("material_id", material.id).maybeSingle(),
          client.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        ]);
        if (reviewError || profileError) throw new Error("Não foi possível carregar sua contribuição.");
        ownReview = review;
        displayName = profile?.display_name ?? "Estudante";
      }
    }
  }
  const reviews = await getPublicReviews(material.id);
  const url = safeExternalUrl(material.url);
  const formatDate = (date?: string | null) => date ? date.split("-").reverse().join("/") : null;
  const facts = [
    ["Nível", material.level], ["Formato", material.format], ["Idioma", material.language],
    ["Acesso ao material", material.access], ["Duração do conteúdo", material.duration],
    ["Estimativa de estudo", material.studyEstimate],
    ["Preço externo", material.externalPrice != null ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(material.externalPrice / 100) : null],
    ["Data de consulta do preço", formatDate(material.priceCheckedAt)],
    ["Última revisão do cadastro", formatDate(material.reviewedAt)],
  ];
  return <section className="container inner-page">
    {!material.isDemo && material.id && <CatalogEvent type="material_opened" token={"material:" + material.id} materialId={material.id} />}
    <Link className="back-link" href="/catalogo">← Voltar ao catálogo</Link>
    <p className="eyebrow">DETALHES DO MATERIAL{material.isDemo && " · EXEMPLO FICTÍCIO"}</p>
    <h1>{material.title}</h1><p className="lead">{material.summary}</p>
    <p className="material-author">Autoria: {material.author}</p>
    {material.isDemo && <p className="demo-callout">{demoDisclaimer}</p>}
    <div className="material-detail-grid">
      <div className="detail-content">
        <section className="detail-section"><h2>Tópicos e cobertura</h2><ul className="topic-tags">{material.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul><p>{material.coverage}</p></section>
        <section className="detail-section"><h2>O que este material não cobre</h2><p>{material.limitations}</p></section>
        <section className="detail-section"><h2>Conhecimentos prévios</h2><p>{material.prerequisites}</p></section>
        <section className="curation-note"><span className="badge">COMENTÁRIO DE CURADORIA{material.isDemo && " · EXEMPLO"}</span><h2>Como poderia ajudar</h2><p>{material.curation}</p><p className="fine-print">{material.isDemo ? "Comentário ilustrativo da curadoria. Não é avaliação nem experiência de estudante." : "Comentário da curadoria, separado das avaliações de estudantes."}</p></section>
      </div>
      <aside className="material-facts" aria-label="Informações do material">
        <h2>Antes de escolher</h2>
        <dl>{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value ?? "Não informado"}</dd></div>)}</dl>
        <p className="fine-print">Duração é o tempo do conteúdo. Estimativa de estudo inclui pausas e prática.{material.isDemo && " Os tempos deste exemplo são fictícios."}</p>
        <h3>Endereço original</h3>
        {url ? <><p className="external-address">{url}</p><a className="button secondary" href={url} target="_blank" rel="noopener noreferrer">{material.isDemo ? "Abrir endereço de exemplo ↗" : "Abrir material original ↗"}</a><p className="fine-print">Você sairá da aplicação em uma nova aba.{material.isDemo && " Esse endereço é demonstrativo e não contém o material descrito."}</p></> : <p>Não informado</p>}
      </aside>
    </div>
    <section className="reviews-empty" aria-labelledby="avaliacoes">
      <h2 id="avaliacoes">Avaliações dos estudantes</h2>
      {reviews.length ? reviews.map((review) => <article className="review" key={review.id}>
        <h3>{review.display_name}</h3><p>{review.subject} · {review.study_context}</p>
        <p className="fine-print">Contexto e uso autodeclarados{review.institution ? ` · Instituição autodeclarada: ${review.institution}` : ""}.</p>
        <p><strong>Tópicos:</strong> {review.topics}</p><p><strong>Pontos positivos:</strong> {review.positives}</p>
        <p><strong>Limitações:</strong> {review.limitations}</p><p>{review.recommends ? "Recomenda para esse contexto." : "Não recomenda para esse contexto."}</p>
      </article>) : <><p>{material.isDemo ? "Ainda não há avaliações aprovadas para este exemplo." : "Ainda não há avaliações aprovadas para este material."}</p><p className="fine-print">Não criamos depoimentos fictícios. Somente contribuições aprovadas pela moderação aparecem aqui.</p></>}
    </section>
    {!material.isDemo && material.id && (userId
      ? <ReviewForm materialId={material.id} review={ownReview} displayName={displayName} />
      : <section className="offer review-contribution"><h2>Utilizou este material?</h2><p>Entre para compartilhar uma experiência autodeclarada. Seu e-mail não será publicado e a avaliação passará por moderação.</p><Link className="button secondary" href={"/entrar?next=" + encodeURIComponent("/catalogo/" + slug)}>Entrar para avaliar</Link></section>)}
  </section>;
}
