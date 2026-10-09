import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Real PostgreSQL semantics, isolated in memory. Auth helpers are test doubles;
// this does NOT validate GoTrue, JWT signatures, PostgREST or the Supabase stack.
const db = new PGlite();
const ids = {
  a: "10000000-0000-0000-0000-000000000001",
  b: "10000000-0000-0000-0000-000000000002",
  admin: "10000000-0000-0000-0000-000000000003",
};
let passed = 0;
async function check(name, work) { await work(); passed++; console.log("OK:", name); }
async function as(role, id) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claims', $1, false)", [JSON.stringify(id ? { sub: id, email: "fixture@example.invalid", role, is_anonymous: false } : {})]);
  await db.exec(`set role ${role}`);
}
async function denied(sql, params = [], code = "42501") {
  await assert.rejects(db.query(sql, params), (error) => error.code === code);
}
const rows = async (sql, params = []) => (await db.query(sql, params)).rows;
try {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin; create role service_role nologin;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.jwt() returns jsonb language sql stable as $$
      select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
    $$;
    create function auth.uid() returns uuid language sql stable as $$
      select (auth.jwt()->>'sub')::uuid;
    $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on all functions in schema auth to anon, authenticated;
    grant usage on schema public to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant execute on functions to public;
  `);
  for (const name of (await readdir("supabase/migrations")).filter((name) => name.endsWith(".sql")).sort()) {
    await db.exec(await readFile(`supabase/migrations/${name}`, "utf8"));
  }
  await check("migrações aplicadas e RLS em todas as tabelas do aplicativo", async () => {
    const unprotected = await rows("select relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private') and relkind='r' and not relrowsecurity");
    assert.equal(unprotected.length, 0);
  });
  for (const id of Object.values(ids)) await db.query("insert into auth.users(id) values ($1)", [id]);
  await db.query("insert into private.admin_members(user_id) values ($1)", [ids.admin]);
  await db.exec("update public.offer_settings set requests_enabled = true");
  const material = (await rows(`insert into public.materials(slug,title,author,summary,coverage,limitations,prerequisites,level,format,language,access,curation,status)
    values ('fixture','Fixture','Author','Summary','Coverage','Limits','None','Iniciante','Artigo','Português','Gratuito','Curated','published') returning id`))[0].id;
  await db.exec(`insert into public.materials(slug,title,author,summary,coverage,limitations,prerequisites,level,format,language,access,curation)
    values ('draft','Draft','Author','Summary','Coverage','Limits','None','Iniciante','Artigo','Português','Gratuito','Curated')`);
  await as("anon");
  await check("visitante lê somente catálogo publicado", async () => assert.equal((await rows("select * from public.materials")).length, 1));
  await check("visitante não lê perfis, contatos ou pedidos", async () => {
    await denied("select * from public.profiles");
    await denied("select * from public.study_requests");
  });
  await check("visitante não acessa administradores nem funções de promoção", async () => {
    await denied("select * from private.admin_members");
    await denied("select public.is_admin()");
  });
  await as("authenticated", ids.a);
  await db.exec("insert into public.profiles(display_name) values ('Aluno A')");
  const requestSql = `insert into public.study_requests(subject,topics,objective,knowledge_level,prerequisites,study_hours)
    values ('Disciplina','Redes neurais','prova','Iniciante','Nenhum',4) returning id,student_id,offer_snapshot`;
  const request = (await rows(requestSql))[0];
  await check("pedido atribuído ao autor e oferta calculada no banco", async () => {
    assert.equal(request.student_id, ids.a);
    assert.equal(request.offer_snapshot.price_cents, 1990);
  });
  await check("estudante não se promove nem consulta tabela de administradores", async () => {
    assert.equal((await rows("select public.is_admin() as value"))[0].value, false);
    await denied("insert into private.admin_members(user_id) values ($1)", [ids.a]);
    await denied("select * from private.admin_members");
  });
  await check("campos de propriedade, preço e pagamento não são aceitos no insert", async () => {
    for (const column of ["student_id", "offer_snapshot", "state", "commercial_status", "agreed_price_cents"]) {
      await denied(`insert into public.study_requests(${column}) values (default)`);
    }
  });
  await check("estudante não altera oferta global nem campos comerciais do pedido", async () => {
    assert.equal((await rows("update public.offer_settings set price_cents=0 returning id")).length, 0);
    await denied("update public.study_requests set state='completed',agreed_price_cents=0 returning id");
  });
  await as("authenticated", ids.b);
  await db.exec("insert into public.profiles(display_name) values ('Aluno B')");
  await check("segunda conta não lê pedido ou perfil da primeira, mesmo por ID", async () => {
    assert.equal((await rows("select * from public.study_requests where id=$1", [request.id])).length, 0);
    assert.equal((await rows("select * from public.profiles where id=$1", [ids.a])).length, 0);
    await denied("insert into public.feedbacks(request_id,kind,message) values ($1,'adjustment','Tentativa')", [request.id], "23514");
  });
  await as("authenticated", ids.admin);
  await check("administrador real consulta pedidos", async () => {
    assert.equal((await rows("select public.is_admin() as value"))[0].value, true);
    assert.equal((await rows("select * from public.study_requests")).length, 1);
  });
  await db.exec("update public.offer_settings set price_cents=2990");
  await check("alterar preço global preserva retrato aceito", async () => assert.equal((await rows("select offer_snapshot from public.study_requests where id=$1", [request.id]))[0].offer_snapshot.price_cents, 1990));
  await check("nem administrador reescreve proprietário ou histórico da oferta", async () => {
    await denied("update public.study_requests set student_id=$1 where id=$2", [ids.b, request.id]);
    await denied("update public.study_requests set offer_snapshot='{}' where id=$1", [request.id]);
  });
  const selection = (await rows("insert into public.recommendation_sets(request_id,version) values ($1,1) returning id", [request.id]))[0].id;
  const recommendation = (await rows(`insert into public.recommendations(selection_id,position,material_id,material_snapshot,rationale,covered_topics,limitations,prerequisites,prioritize)
    values ($1,1,$2,'{"title":"Fixture"}','Justificativa','Tópicos','Limites','Base','Parte 1') returning id`, [selection, material]))[0].id;
  await as("authenticated", ids.a);
  await check("dono não vê seleção ou opções em rascunho", async () => {
    assert.equal((await rows("select * from public.recommendation_sets")).length, 0);
    assert.equal((await rows("select * from public.recommendations")).length, 0);
    await denied("insert into public.recommendation_sets(request_id,version) values ($1,2)", [request.id]);
  });
  await as("authenticated", ids.admin);
  await db.query("update public.study_requests set state='in_review' where id=$1", [request.id]);
  await db.query("update public.recommendation_sets set single_option_reason='Única opção pertinente' where id=$1", [selection]);
  await db.query("select public.publish_selection($1)", [selection]);
  await as("authenticated", ids.a);
  await check("publicação libera seleção apenas ao estudante correto", async () => {
    assert.equal((await rows("select * from public.recommendations")).length, 1);
    await as("authenticated", ids.b);
    assert.equal((await rows("select * from public.recommendations")).length, 0);
    await as("authenticated", ids.a);
  });
  await check("estudante registra feedback no próprio pedido", async () => {
    await db.query("insert into public.feedbacks(request_id,recommendation_id,kind,message,used_material,met_objective,search_effort) values ($1,$2,'usage','Ajudou',true,true,'Busca menor')", [request.id, recommendation]);
    assert.equal((await rows("select * from public.feedbacks")).length, 1);
  });
  await as("authenticated", ids.admin);
  await check("publicação impede alteração posterior da seleção e das opções", async () => {
    await denied("update public.recommendations set rationale='Reescrita indevida' where id=$1", [recommendation], "23514");
    await denied("delete from public.recommendations where id=$1", [recommendation], "23514");
    await denied("update public.recommendation_sets set status='draft',published_at=null where id=$1", [selection], "23514");
  });
  await check("estados e valor comercial são validados pelo banco", async () => {
    await denied("update public.study_requests set state='received' where id=$1", [request.id], "23514");
    await denied("update public.study_requests set commercial_status='payment_reported' where id=$1", [request.id], "23514");
  });
  await as("authenticated", ids.a);
  await check("pedido de ajuste mantém publicação anterior e muda somente operação", async () => {
    await db.query("insert into public.feedbacks(request_id,kind,message) values ($1,'adjustment','Preciso de exemplos')", [request.id]);
    const value=(await rows("select state,commercial_status from public.study_requests where id=$1",[request.id]))[0];
    assert.equal(value.state,"adjustment_requested");
    assert.equal(value.commercial_status,"to_agree");
    assert.equal((await rows("select * from public.recommendations")).length,1);
  });
  await as("authenticated", ids.admin);
  await db.query("update public.study_requests set state='in_review' where id=$1",[request.id]);
  const nextSelection=(await rows("select public.save_selection($1,'[]',null,null) as id",[request.id]))[0].id;
  await check("publicação vazia exige justificativa e falha sem publicar parcialmente",async()=>{
    await denied("select public.publish_selection($1)",[nextSelection],"23514");
    assert.equal((await rows("select status from public.recommendation_sets where id=$1",[nextSelection]))[0].status,"draft");
    assert.equal((await rows("select state from public.study_requests where id=$1",[request.id]))[0].state,"in_review");
  });
  await as("authenticated", ids.a);

  const review = (await rows(`insert into public.reviews(material_id,display_name,used_material,subject,topics,study_context,positives,limitations,recommends)
    values ($1,'Aluno',true,'IA','Redes','Iniciante','Clareza','Pouca prática',true) returning id`, [material]))[0].id;
  await check("autor não autoaprova avaliação e lê somente a própria autoria", async () => {
    await denied("update public.reviews set status='approved' where id=$1", [review]);
    const own = await rows("select author_id from public.reviews where id=$1", [review]);
    assert.equal(own.length, 1);
    assert.equal(own[0].author_id, ids.a);
    await as("authenticated", ids.b);
    assert.equal((await rows("select author_id from public.reviews where id=$1", [review])).length, 0);
    await as("authenticated", ids.a);
  });
  await as("anon");
  await check("avaliação pendente não é pública", async () => assert.equal((await rows("select * from public.published_reviews")).length, 0));
  await as("authenticated", ids.admin);
  await db.query("update public.reviews set status='approved' where id=$1", [review]);
  await as("anon");
  await check("avaliação aprovada publica apenas colunas permitidas", async () => {
    const publicReviews = await rows("select * from public.published_reviews");
    assert.equal(publicReviews.length, 1);
    assert.equal("author_id" in publicReviews[0], false);
    assert.equal("email" in publicReviews[0], false);
    await denied("select author_id from public.reviews");
  });
  await as("authenticated", ids.a);
  await db.query("update public.reviews set positives='Nova análise' where id=$1", [review]);
  await as("anon");
  await check("editar avaliação aprovada exige nova moderação", async () => {
    assert.equal((await rows("select * from public.published_reviews")).length, 0);
    await as("authenticated", ids.a);
    const own = (await rows("select status,moderated_at from public.reviews where id=$1", [review]))[0];
    assert.equal(own.status, "pending");
    assert.equal(own.moderated_at, null);
    await as("anon");
  });
  const eventKey = "20000000-0000-0000-0000-000000000001";
  await check("eventos públicos são mínimos e idempotentes em recargas", async () => {
    assert.equal((await rows("select public.record_catalog_event($1,'catalog_visit',null) as inserted", [eventKey]))[0].inserted, true);
    assert.equal((await rows("select public.record_catalog_event($1,'catalog_visit',null) as inserted", [eventKey]))[0].inserted, false);
    await denied("select * from public.analytics_events");
  });
  await as("authenticated", ids.a);
  await check("estudante não consulta indicadores administrativos", async () => {
    await denied("select public.pilot_metrics(now()-interval '30 days',now()+interval '1 minute')");
  });
  await as("authenticated", ids.admin);
  await db.query("update public.study_requests set commercial_status='payment_reported',agreed_price_cents=1990 where id=$1", [request.id]);
  await check("pagamento informado ganha data sem concluir operação", async () => {
    const value=(await rows("select state,commercial_status,payment_reported_at from public.study_requests where id=$1",[request.id]))[0];
    assert.equal(value.state,"in_review");
    assert.equal(value.commercial_status,"payment_reported");
    assert.ok(value.payment_reported_at);
  });
  await check("indicadores usam registros operacionais e denominadores", async () => {
    const value=(await rows("select public.pilot_metrics(now()-interval '30 days',now()+interval '1 minute') as metrics"))[0].metrics;
    assert.equal(value.catalog_visits,1);
    assert.equal(value.requests,1);
    assert.equal(value.requesting_students,1);
    assert.equal(value.selected_requests,1);
    assert.equal(value.payments_reported,1);
    assert.equal(value.reviews_submitted,1);
    assert.equal(value.usage_declarations,1);
  });
  await as("authenticated", ids.a);
  await check("limite de abuso vale também em acesso direto ao banco", async () => {
    for (let i = 0; i < 9; i++) await rows(requestSql);
    await denied(requestSql, [], "23514");
  });
  await as("authenticated", ids.admin);
  await check("URL de material rejeita protocolos executáveis", async () => {
    await denied("update public.materials set original_url='javascript:alert(1)' where id=$1", [material], "23514");
  });
  await as("postgres");
  await db.query("delete from private.admin_members where user_id=$1", [ids.admin]);
  await as("authenticated", ids.admin);
  await check("revogação de administrador tem efeito sem renovar JWT", async () => assert.equal((await rows("select public.is_admin() as value"))[0].value, false));
  console.log(`${passed} verificações SQL aprovadas. GoTrue/PostgREST não estão cobertos por este teste.`);
} finally {
  await db.close();
}
