import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { money } from "@/lib/workflow";

export const metadata = { title: "Indicadores do piloto" };

type Metrics = {
  start: string; end: string; requests: number; requesting_students: number; selected_requests: number;
  payments_reported: number; paying_students: number; payment_value_cents: number;
  timed_requests: number; curator_minutes: number; usage_declarations: number; materials_used: number;
  objective_answers: number; objectives_met: number; adjustments: number; reviews_submitted: number;
  reviews_approved: number; reviews_pending: number; reviews_rejected: number;
  catalog_visits: number; filters_applied: number; material_opens: number;
};

function dateInBrazil(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
function validDate(value: unknown) { return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + "T00:00:00Z")); }
function rate(part: number, total: number) { return total ? new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 }).format(part / total) : "Sem denominador"; }
function Card({ title, value, detail }: { title: string; value: string | number; detail: string }) {
  return <article className="metric-card"><h2>{title}</h2><strong>{value}</strong><p>{detail}</p></article>;
}

export default async function MetricsPage({ searchParams }: { searchParams: Promise<{ inicio?: string; fim?: string }> }) {
  const { client } = await requireAdmin();
  const query = await searchParams;
  const today = dateInBrazil();
  const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 29);
  const start = validDate(query.inicio) ? query.inicio! : dateInBrazil(monthAgo);
  const end = validDate(query.fim) ? query.fim! : today;
  const startAt = new Date(start + "T00:00:00-03:00");
  const endAt = new Date(end + "T00:00:00-03:00"); endAt.setDate(endAt.getDate() + 1);
  if (start > end || end > today || endAt.getTime() - startAt.getTime() > 366 * 86400000) {
    throw new Error("Período inválido. Use até 366 dias e não informe datas futuras.");
  }
  const { data, error } = await client.rpc("pilot_metrics", { p_start: startAt.toISOString(), p_end: endAt.toISOString() });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) throw new Error("Indicadores indisponíveis.");
  const m = data as unknown as Metrics;
  const averageMinutes = m.timed_requests ? Math.round(m.curator_minutes / m.timed_requests) : 0;
  return <section className="container inner-page">
    <Link className="back-link" href="/admin">← Administração</Link>
    <p className="eyebrow">VALIDAÇÃO DO PILOTO</p><h1>Indicadores</h1>
    <p className="lead">Contagens do período de {new Date(start + "T12:00:00").toLocaleDateString("pt-BR")} a {new Date(end + "T12:00:00").toLocaleDateString("pt-BR")}, inclusive.</p>
    <form className="filter-actions" action="/admin/indicadores">
      <div className="field"><label htmlFor="inicio">Início</label><input id="inicio" name="inicio" type="date" defaultValue={start} max={today} required /></div>
      <div className="field"><label htmlFor="fim">Fim</label><input id="fim" name="fim" type="date" defaultValue={end} max={today} required /></div>
      <button className="button secondary">Atualizar período</button>
    </form>
    <h2 className="subheading">Interesse no catálogo</h2>
    <div className="metrics-grid">
      <Card title="Visitas ao catálogo" value={m.catalog_visits} detail="Visitas por aba, sem identificação de pessoas; recargas simples são deduplicadas." />
      <Card title="Filtros aplicados" value={m.filters_applied} detail="Combinações aplicadas por aba; termos e valores dos filtros não são armazenados." />
      <Card title="Materiais abertos" value={m.material_opens} detail="Aberturas de detalhes. Abertura não significa uso do material." />
    </div>
    <h2 className="subheading">Pedidos e seleção</h2>
    <div className="metrics-grid">
      <Card title="Pedidos" value={m.requests} detail={m.requesting_students + " estudantes distintos fizeram esses pedidos."} />
      <Card title="Primeira seleção publicada" value={m.selected_requests} detail={rate(m.selected_requests, m.requests) + " de " + m.requests + " pedidos criados no período."} />
      <Card title="Ajustes solicitados" value={m.adjustments} detail="Registros de ajuste no período; separados de experiências de uso." />
      <Card title="Tempo de curadoria" value={m.curator_minutes + " min"} detail={averageMinutes + " min em média entre " + m.timed_requests + " pedidos com tempo registrado."} />
    </div>
    <h2 className="subheading">Uso declarado</h2>
    <div className="metrics-grid">
      <Card title="Experiências registradas" value={m.usage_declarations} detail={m.materials_used + " declararam ter utilizado uma opção recomendada."} />
      <Card title="Objetivo atendido" value={m.objectives_met} detail={rate(m.objectives_met, m.objective_answers) + " entre " + m.objective_answers + " declarações elegíveis."} />
      <Card title="Avaliações enviadas" value={m.reviews_submitted} detail={m.reviews_approved + " aprovadas, " + m.reviews_pending + " pendentes e " + m.reviews_rejected + " não aprovadas."} />
    </div>
    <h2 className="subheading">Registro comercial manual</h2>
    <div className="metrics-grid">
      <Card title="Pagamentos informados" value={m.payments_reported} detail={m.paying_students + " estudantes distintos; não há verificação financeira automática."} />
      <Card title="Valor informado" value={money(m.payment_value_cents)} detail={rate(m.paying_students, m.requesting_students) + " de " + m.requesting_students + " estudantes que fizeram pedidos no período."} />
    </div>
    <p className="demo-callout">As taxas mostram contagem e denominador. Visitas são eventos deduplicados por aba, não visitantes únicos. Amostras pequenas não comprovam demanda.</p>
  </section>;
}
