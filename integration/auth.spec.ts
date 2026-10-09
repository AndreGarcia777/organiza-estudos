import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { expectAccessible } from "./accessibility";

test("Supabase real: sessão, perfil, rascunho, isolamento, administrador e recuperação", async ({ page }) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const secret = process.env.TEST_LOCAL_SERVICE_KEY!;
  const connectionString = process.env.TEST_LOCAL_DATABASE_URL!;
  expect(["127.0.0.1", "localhost"]).toContain(new URL(url).hostname);
  expect(["127.0.0.1", "localhost"]).toContain(new URL(connectionString).hostname);
  const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const sql = new Client({ connectionString });
  const accounts: { id: string; email: string; password: string }[] = [];
  await sql.connect();
  try {
    for (let i = 0; i < 3; i++) {
      const email = `teste-${randomUUID()}@example.invalid`;
      const password = randomUUID() + "aA1!";
      const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
      expect(error?.message).toBeUndefined();
      accounts.push({ id: data.user!.id, email, password });
    }
    const [a, b, curator] = accounts;
    await sql.query("insert into private.admin_members(user_id) values ($1)", [curator.id]);
    const settings = await sql.query("select requests_enabled from public.offer_settings where id");
    await sql.query("begin");
    await sql.query("update public.offer_settings set requests_enabled=true where id");
    await sql.query("select set_config('request.jwt.claims',$1,true)", [JSON.stringify({ sub: a.id, email: a.email })]);
    const request = await sql.query(`insert into public.study_requests(subject,topics,objective,knowledge_level,prerequisites,study_hours) values ('Teste local','Redes','prova','Iniciante','Nenhum',4) returning id`);
    await sql.query("update public.offer_settings set requests_enabled=$1 where id", [settings.rows[0].requests_enabled]);
    await sql.query("commit");
    const aClient = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const bClient = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } });
    expect((await aClient.auth.signInWithPassword(a)).error).toBeNull();
    expect((await bClient.auth.signInWithPassword(b)).error).toBeNull();
    const own = await aClient.from("study_requests").select("id").eq("id", request.rows[0].id);
    expect(own.error).toBeNull();
    expect(own.data).toHaveLength(1);
    const other = await bClient.from("study_requests").select("id").eq("id", request.rows[0].id);
    expect(other.error).toBeNull();
    expect(other.data).toHaveLength(0);
    const forged = await aClient.from("study_requests").update({ commercial_status: "payment_reported" }).eq("id", request.rows[0].id).select("id");
    expect(forged.data ?? []).toHaveLength(0);
    await aClient.auth.updateUser({ data: { role: "admin" } });
    expect((await aClient.rpc("is_admin")).data).toBe(false);

    await page.goto("/conta");
    await expect(page).toHaveURL(/\/entrar\?next=/);
    await page.goto("/solicitar");
    await page.getByLabel("Disciplina", { exact: true }).fill("Rascunho de teste");
    await page.getByLabel("Tópicos que precisa estudar").fill("Redes neurais");
    await page.getByRole("button", { name: "Guardar rascunho e entrar" }).click();
    await page.getByLabel("E-mail", { exact: true }).fill(a.email);
    await page.getByLabel("Senha", { exact: true }).fill(a.password);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL("/solicitar");
    await expect(page.getByLabel("Disciplina", { exact: true })).toHaveValue("Rascunho de teste");
    await page.goto("/conta");
    await page.getByLabel("Nome de exibição").fill("Aluno de teste");
    await page.getByRole("button", { name: "Salvar nome" }).click();
    await expect(page.getByRole("status")).toContainText("salvo");
    await page.reload();
    await expect(page.getByLabel("Nome de exibição")).toHaveValue("Aluno de teste");
    await expectAccessible(page, "área do estudante");
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Esta área é exclusiva da administração." })).toBeVisible();
    await page.goto("/conta");
    await page.getByRole("button", { name: "Sair", exact: true }).click();
    await expect(page).toHaveURL("/entrar");
    expect(await page.evaluate(() => sessionStorage.getItem("guia-estudos:request-draft:v1"))).toBeNull();
    await page.goto("/conta");
    await expect(page).toHaveURL(/\/entrar/);
    await page.getByLabel("E-mail", { exact: true }).fill(curator.email);
    await page.getByLabel("Senha", { exact: true }).fill(curator.password);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL("/conta");
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Acesso administrativo verificado." })).toBeVisible();
    await expectAccessible(page, "painel administrativo");
    await page.goto("/conta");
    await page.getByRole("button", { name: "Sair", exact: true }).click();

    await expect(page).toHaveURL("/entrar");
    const recovery = await admin.auth.admin.generateLink({ type: "recovery", email: a.email });
    expect(recovery.error).toBeNull();
    await page.goto(`/auth/confirm?type=recovery&token_hash=${encodeURIComponent(recovery.data.properties!.hashed_token)}`);
    await expect(page).toHaveURL("/redefinir-senha");
    const newPassword = randomUUID() + "aA1!";
    await page.getByLabel("Nova senha", { exact: true }).fill(newPassword);
    await page.getByLabel("Confirme a senha").fill(newPassword);
    await page.getByRole("button", { name: "Salvar nova senha" }).click();
    await expect(page).toHaveURL("/entrar?senha=alterada");
    expect((await aClient.auth.signInWithPassword({ email: a.email, password: newPassword })).error).toBeNull();
    await aClient.auth.signOut();
    await bClient.auth.signOut();
  } finally {
    await sql.query("rollback");
    for (const account of accounts) {
      const { error } = await admin.auth.admin.deleteUser(account.id);
      if (error) throw new Error("Não foi possível remover uma conta temporária do teste local.");
    }
    await sql.end();
  }
});
