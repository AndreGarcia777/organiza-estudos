import { ActionForm } from "@/components/action-form";
import { Field, Select } from "@/components/fields";
import type { Database } from "@/lib/supabase/database.types";

type Review = Database["public"]["Tables"]["reviews"]["Row"];

export function ReviewForm({ materialId, review, displayName }: { materialId: string; review: Review | null; displayName: string }) {
  const status = review ? { pending: "Aguardando moderação", approved: "Aprovada e pública", rejected: "Não aprovada" }[review.status] ?? review.status : null;
  return <section className="offer review-contribution" aria-labelledby="contribuir-avaliacao">
    <h2 id="contribuir-avaliacao">{review ? "Edite sua avaliação" : "Conte sua experiência"}</h2>
    {status && <p className="demo-callout">Situação da sua avaliação: {status}.</p>}
    <p>Contribua somente depois de utilizar o material. As informações sobre disciplina, contexto e instituição são autodeclaradas. Seu e-mail não será publicado.</p>
    {review?.status === "approved" && <p className="fine-print">Ao editar uma avaliação pública, ela volta para moderação e deixa de aparecer no catálogo até nova aprovação.</p>}
    <ActionForm operation="review" label={review ? "Salvar edição para moderação" : "Enviar para moderação"}>
      <input type="hidden" name="material_id" value={materialId} />
      <div className="form-grid">
        <Field name="display_name" label="Nome de exibição" required minLength={2} maxLength={60} value={review?.display_name ?? displayName} />
        <Field name="subject" label="Disciplina em que utilizou" required minLength={2} maxLength={150} value={review?.subject} />
        <Field name="topics" label="Tópicos em que ajudou" area required minLength={2} maxLength={1000} value={review?.topics} />
        <Field name="study_context" label="Seu contexto ou nível de estudo" area required minLength={2} maxLength={1000} value={review?.study_context} />
        <Field name="institution" label="Instituição (opcional e não verificada)" maxLength={150} value={review?.institution ?? ""} />
        <Select name="recommends" label="Recomenda para esse contexto?" value={review?.recommends === false ? "no" : "yes"} options={{ yes: "Sim", no: "Não" }} />
        <Field name="positives" label="Pontos positivos" area required minLength={2} maxLength={2000} value={review?.positives} />
        <Field name="limitations" label="Limitações percebidas" area required minLength={2} maxLength={2000} value={review?.limitations} />
      </div>
      <label className="check"><input type="checkbox" name="used_material" required defaultChecked={review?.used_material} />Declaro que utilizei este material. Esta declaração não é verificada pela plataforma.</label>
    </ActionForm>
  </section>;
}
