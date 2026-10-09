import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { ActionForm } from "@/components/action-form";
import { Select } from "@/components/fields";

export const metadata = { title: "Moderação de avaliações" };

const labels: Record<string, string> = { pending: "Pendente", approved: "Aprovada", rejected: "Não aprovada" };

export default async function ReviewsAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { client } = await requireAdmin();
  const requested = (await searchParams).status;
  const status = requested && labels[requested] ? requested : "pending";
  const { data: reviews, error } = await client.from("reviews")
    .select("id,material_id,display_name,subject,topics,study_context,institution,positives,limitations,recommends,status,created_at,updated_at")
    .eq("status", status).order("updated_at", { ascending: false }).limit(100);
  if (error) throw new Error("Avaliações indisponíveis.");
  const ids = [...new Set(reviews.map((review) => review.material_id))];
  const { data: materials, error: materialError } = ids.length
    ? await client.from("materials").select("id,title,slug,status").in("id", ids)
    : { data: [], error: null };
  if (materialError) throw new Error("Materiais das avaliações indisponíveis.");
  const materialMap = new Map(materials.map((material) => [material.id, material]));
  return <section className="container inner-page">
    <Link className="back-link" href="/admin">← Administração</Link>
    <p className="eyebrow">MODERAÇÃO</p><h1>Avaliações dos estudantes</h1>
    <p className="lead">Contexto, uso e instituição são autodeclarados. A aprovação confirma apenas que o conteúdo foi revisado para publicação.</p>
    <form action="/admin/avaliacoes" className="filter-actions">
      <Select id="review-status-filter" name="status" label="Situação" value={status} options={labels} />
      <button className="button secondary">Filtrar avaliações</button>
    </form>
    <div className="moderation-list">{reviews.map((review) => {
      const material = materialMap.get(review.material_id);
      return <article className="offer" key={review.id}>
        <p className="eyebrow">{labels[review.status]}</p>
        <h2>{material?.title ?? "Material removido"}</h2>
        <p><strong>{review.display_name}</strong> · {review.subject} · {review.study_context}</p>
        <p className="fine-print">Uso, contexto{review.institution ? " e instituição (" + review.institution + ")" : ""} autodeclarados. Enviada em {new Date(review.created_at).toLocaleString("pt-BR")}.</p>
        <dl className="facts">
          <div><dt>Tópicos</dt><dd>{review.topics}</dd></div>
          <div><dt>Pontos positivos</dt><dd>{review.positives}</dd></div>
          <div><dt>Limitações</dt><dd>{review.limitations}</dd></div>
          <div><dt>Recomendação no contexto</dt><dd>{review.recommends ? "Recomenda" : "Não recomenda"}</dd></div>
        </dl>
        {material?.status === "published" && <Link className="text-link" href={"/catalogo/" + material.slug}>Abrir página pública →</Link>}
        <ActionForm operation="moderate_review" label="Salvar decisão">
          <input type="hidden" name="review_id" value={review.id} />
          <Select id={"review-decision-" + review.id} name="status" label="Decisão" value={review.status === "rejected" ? "rejected" : "approved"} options={{ approved: "Aprovar para publicação", rejected: "Não aprovar" }} />
        </ActionForm>
      </article>;
    })}</div>
    {!reviews.length && <div className="empty-state"><h2>Nenhuma avaliação neste filtro.</h2><p>Novas contribuições aparecem como pendentes.</p></div>}
    <p className="fine-print">Até 100 avaliações mais recentes por filtro. E-mails e UUIDs de autores não são exibidos.</p>
  </section>;
}
