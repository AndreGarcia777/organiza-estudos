import type { Metadata } from "next";
import Link from "next/link";
import { demoDisclaimer, normalizeSearch } from "@/data/demo-materials";

import { getCatalog } from "@/lib/catalog";
import { appMode } from "@/lib/app-mode";
import { CatalogEvent } from "@/components/catalog-event";

export const metadata: Metadata = { title: "Catálogo" };

type Query = Record<string, string | string[] | undefined>;
const first = (value: Query[string]) => (Array.isArray(value) ? value[0] : value) ?? "";
const filterFields = [
  { name: "topico", label: "Tópico", key: "topics" },
  { name: "nivel", label: "Nível", key: "level" },
  { name: "formato", label: "Formato", key: "format" },
  { name: "custo", label: "Custo do material", key: "access" },
] as const;

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const catalog = await getCatalog();
  const demo = appMode() === "demo";
  const search = first(query.q).slice(0, 120);
  const filters = Object.fromEntries(filterFields.map(({ name }) => [name, first(query[name])]));
  const terms = normalizeSearch(search).split(/\s+/).filter(Boolean);
  const materials = catalog.filter((material) => {
    const text = normalizeSearch([material.title, material.author, material.summary, ...material.topics].join(" "));
    return terms.every((term) => text.includes(term)) && filterFields.every(({ name, key }) => {
      const value = material[key];
      return !filters[name] || (Array.isArray(value) ? value.includes(filters[name]) : value === filters[name]);
    });
  });
  const hasFilters = Boolean(search || Object.values(filters).some(Boolean));

  return (
    <section className="container inner-page">
      {!demo && <CatalogEvent type="catalog_visit" token="catalog-visit" />}
      {!demo && hasFilters && <CatalogEvent type="filter_applied" token={"filter:" + JSON.stringify([search, filters])} />}
      <p className="eyebrow">EXPLORE NO SEU RITMO</p>
      <h1>Um ponto de partida para seus estudos.</h1>
      <p className="lead">Compare tópicos, pré-requisitos e formatos. Escolha com mais contexto sobre o que cada material oferece.</p>
      {demo && <p className="demo-callout">{demoDisclaimer}</p>}

      <form key={JSON.stringify([search, filters])} action="/catalogo" method="get" className="catalog-filters" role="search" aria-label="Buscar materiais">
        <label className="field search-field">
          <span>Buscar por título, autor ou tópico</span>
          <input type="search" name="q" defaultValue={search} maxLength={120} placeholder="Ex.: funções ou redes neurais" />
        </label>
        <div className="filter-grid">
          {filterFields.map(({ name, label, key }) => {
            const options = [...new Set(catalog.flatMap((material) => material[key]))].sort((a, b) => a.localeCompare(b, "pt-BR"));
            return <label className="field" key={name}>
              <span>{label}</span>
              <select name={name} defaultValue={filters[name]}>
                <option value="">Todos</option>
                {filters[name] && !options.includes(filters[name]) && <option value={filters[name]}>Filtro não reconhecido</option>}
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>;
          })}
        </div>
        <div className="filter-actions">
          <button className="button primary" type="submit">Aplicar filtros</button>
          <Link className="text-link" href="/catalogo">Limpar filtros</Link>
          <p className="fine-print">Consulta gratuita · sem login</p>
        </div>
      </form>

      <div className="results-heading">
        <h2>{materials.length} {materials.length === 1 ? "material encontrado" : "materiais encontrados"}</h2>
        <span>{demo ? "Catálogo demonstrativo" : "Catálogo publicado"}</span>
      </div>
      {materials.length === 0 ? (
        <div className="empty-state">
          <h2>{catalog.length ? "Nenhum material com esses filtros." : "Ainda não há materiais publicados."}</h2>
          <p>{catalog.length ? "Tente um termo mais amplo ou remova alguns filtros para explorar os materiais disponíveis." : "A curadoria ainda não publicou materiais. Volte em breve."}</p>
          <Link className="button secondary" href="/catalogo">Ver todos os materiais</Link>
        </div>
      ) : (
        <div className="materials-grid">
          {materials.map((material) => (
            <article className="material-card" key={material.slug}>
              <div className="card-top"><span className="badge">{material.isDemo ? "EXEMPLO FICTÍCIO" : "MATERIAL PUBLICADO"}</span><span className="access-tag">{material.access}</span></div>
              <p className="material-format">{material.format} · {material.level} · {material.language}</p>
              <h2><Link href={`/catalogo/${material.slug}`}>{material.title}</Link></h2>
              <p className="material-author">{material.author}</p>
              <p>{material.summary}</p>
              <ul className="topic-tags" aria-label="Tópicos">{material.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
              <dl className="card-facts">
                <div><dt>Duração do conteúdo</dt><dd>{material.duration ?? "Não informado"}</dd></div>
                <div><dt>Estimativa de estudo</dt><dd>{material.studyEstimate ?? "Não informado"}</dd></div>
              </dl>
              <Link className="text-link" href={`/catalogo/${material.slug}`} aria-label={`Ver detalhes de ${material.title}`}>Ver detalhes <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      )}
      <aside className="catalog-help"><h2>Precisa de uma seleção para o seu contexto?</h2><p>{demo ? "Conheça a proposta de curadoria manual e experimente um cenário fictício." : "Conheça a proposta de curadoria manual e prepare um rascunho para continuar depois."}</p><Link className="text-link" href="/solicitar">Conhecer a seleção personalizada →</Link></aside>
    </section>
  );
}
