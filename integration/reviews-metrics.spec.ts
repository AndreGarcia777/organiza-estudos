import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";
import { randomUUID } from "node:crypto";
import { expectAccessible } from "./accessibility";

async function login(page: Page, email: string, password: string) {
  await page.goto("/entrar");
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL("/conta");
}

test("avaliacoes moderadas, eventos anonimos e indicadores do piloto", async ({ browser, page }) => {
  test.setTimeout(120000);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const service = createClient(url, process.env.TEST_LOCAL_SERVICE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  const publicClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const sql = new Client({ connectionString: process.env.TEST_LOCAL_DATABASE_URL });
  await sql.connect();
  const suffix = randomUUID();
  const slug = "avaliacao-" + suffix;
  const eventKey = randomUUID();
  const openedEventKey = randomUUID();
  const users: { id: string; email: string; password: string }[] = [];
  let materialId: string | undefined;
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  try {
    for (const prefix of ["student", "moderator"]) {
      const email = `${prefix}-${randomUUID()}@example.invalid`;
      const password = randomUUID() + "Aa1!";
      const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
      expect(error?.message).toBeUndefined();
      users.push({ id: data.user!.id, email, password });
    }
    const [student, moderator] = users;
    await sql.query("insert into private.admin_members(user_id) values($1)", [moderator.id]);
    materialId = (await sql.query(`insert into public.materials
      (slug,title,author,summary,coverage,limitations,prerequisites,level,format,language,access,curation,status)
      values($1,$2,'Equipe piloto','Resumo validado','Topicos essenciais','Escopo introdutorio','Nenhum',
      'Iniciante','Artigo','Portugues','Gratuito','Revisado para o piloto','published') returning id`,
      [slug, "Material avaliado " + suffix])).rows[0].id;

    expect((await publicClient.rpc("record_catalog_event", { p_event_key: eventKey, p_event_type: "catalog_visit", p_material_id: null })).data).toBe(true);
    expect((await publicClient.rpc("record_catalog_event", { p_event_key: eventKey, p_event_type: "catalog_visit", p_material_id: null })).data).toBe(false);
    expect((await publicClient.rpc("record_catalog_event", { p_event_key: openedEventKey, p_event_type: "material_opened", p_material_id: materialId })).data).toBe(true);
    expect((await publicClient.from("analytics_events").select("*")).error).not.toBeNull();

    await login(page, student.email, student.password);
    await page.goto("/catalogo/" + slug);
    await page.getByLabel("Nome de exibição").fill("Aluno piloto");
    await page.getByLabel("Disciplina em que utilizou").fill("Estruturas de dados");
    await page.getByLabel("Tópicos em que ajudou").fill("Arvores e busca");
    await page.getByLabel("Seu contexto ou nível de estudo").fill("Graduacao, primeiro semestre");
    await page.getByLabel("Instituição", { exact: false }).fill("Instituicao autodeclarada");
    await page.getByLabel("Pontos positivos").fill("Exemplos claros e objetivos");
    await page.getByLabel("Limitações percebidas").fill("Poucos exercicios avancados");
    await page.getByLabel("Declaro que utilizei", { exact: false }).check();
    await page.getByRole("button", { name: "Enviar para moderação" }).click();
    await expect(page.getByRole("status")).toContainText("enviada");

    const review = (await sql.query("select id,status from public.reviews where author_id=$1 and material_id=$2", [student.id, materialId])).rows[0];
    expect(review.status).toBe("pending");
    expect((await publicClient.from("published_reviews").select("*").eq("material_id", materialId)).data).toHaveLength(0);
    const studentClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    expect((await studentClient.auth.signInWithPassword(student)).error).toBeNull();
    expect((await studentClient.from("reviews").update({ status: "approved" }).eq("id", review.id)).error).not.toBeNull();

    await login(adminPage, moderator.email, moderator.password);
    await adminPage.goto("/admin/avaliacoes");
    const pending = adminPage.locator("article.offer").filter({ hasText: "Material avaliado " + suffix });
    await expect(pending).toBeVisible();
    await expectAccessible(adminPage, "moderação de avaliações");
    await expect(pending).not.toContainText(student.email);
    await pending.getByRole("button", { name: "Salvar decisão" }).click();
    await expect(pending).toHaveCount(0);
    expect((await publicClient.from("published_reviews").select("display_name").eq("material_id", materialId)).data).toEqual([{ display_name: "Aluno piloto" }]);

    await page.reload();
    await expect(page.getByRole("heading", { name: "Aluno piloto" })).toBeVisible();
    await page.getByLabel("Pontos positivos").fill("Exemplos claros, objetivos e bem organizados");
    await page.getByRole("button", { name: "Salvar edição para moderação" }).click();
    await expect(page.getByRole("status")).toContainText("enviada");
    expect((await publicClient.from("published_reviews").select("*").eq("material_id", materialId)).data).toHaveLength(0);
    expect((await sql.query("select status,moderated_at from public.reviews where id=$1", [review.id])).rows[0]).toEqual({ status: "pending", moderated_at: null });

    await adminPage.goto("/admin/avaliacoes?status=pending&refresh=" + Date.now());
    const edited = adminPage.locator("article.offer").filter({ hasText: "Material avaliado " + suffix });
    await expect(edited).toBeVisible();
    await edited.getByLabel("Decisão").selectOption("rejected");
    await edited.getByRole("button", { name: "Salvar decisão" }).click();
    await expect(edited).toHaveCount(0);
    expect((await sql.query("select status,moderated_at is not null as moderated from public.reviews where id=$1", [review.id])).rows[0]).toEqual({ status: "rejected", moderated: true });

    const moderatorClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    expect((await moderatorClient.auth.signInWithPassword(moderator)).error).toBeNull();
    const start = new Date(Date.now() - 86400000).toISOString();
    const end = new Date(Date.now() + 86400000).toISOString();
    const { data: metrics, error: metricsError } = await moderatorClient.rpc("pilot_metrics", { p_start: start, p_end: end });
    expect(metricsError).toBeNull();
    const values = metrics as { catalog_visits: number; material_opens: number; reviews_submitted: number; reviews_rejected: number };
    expect(values.catalog_visits).toBeGreaterThanOrEqual(1);
    expect(values.material_opens).toBeGreaterThanOrEqual(1);
    expect(values.reviews_submitted).toBeGreaterThanOrEqual(1);
    expect(values.reviews_rejected).toBeGreaterThanOrEqual(1);
    await adminPage.goto("/admin/indicadores");
    await expect(adminPage.getByRole("heading", { name: "Indicadores" })).toBeVisible();
    await expectAccessible(adminPage, "indicadores do piloto");
    await expect(adminPage.locator(".metric-card").filter({ hasText: "Visitas ao catálogo" }).locator("strong")).toHaveText(String(values.catalog_visits));
    await expect(adminPage.locator(".metric-card").filter({ hasText: "Avaliações enviadas" })).toContainText("não aprovadas");
  } finally {
    await adminContext.close();
    for (const user of users) {
      const { error } = await service.auth.admin.deleteUser(user.id);
      if (error) throw new Error("Falha ao remover fixture da fase 5.");
    }
    if (materialId) await sql.query("delete from public.materials where id=$1", [materialId]);
    await sql.query("delete from public.analytics_events where event_key=$1", [eventKey]);
    await sql.end();
  }
});
