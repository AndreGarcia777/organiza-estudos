import { test, expect } from "@playwright/test";

test("avaliação preserva o login e bloqueia acesso direto aos fluxos de e-mail", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.getByLabel("E-mail", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Senha", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Criar conta" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Esqueci minha senha" })).toHaveCount(0);
  await expect(page.getByText("Versão de avaliação:", { exact: false })).toBeVisible();
  for (const route of ["/cadastrar", "/recuperar-senha", "/redefinir-senha"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/entrar(?:\?|$)/);
    await expect(page.getByRole("button", { name: "Entrar", exact: true })).toBeVisible();
  }
  for (const route of ["/auth/callback?code=invalid", "/auth/confirm?type=recovery&token_hash=invalid"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/entrar\?erro=confirmacao$/);
  }
});

test("envio adulterado é recusado no servidor antes de acessar o Supabase", async ({ page }) => {
  for (const mode of ["signup", "recover", "reset"]) {
    await page.goto("/entrar");
    await page.getByLabel("E-mail", { exact: true }).fill("avaliacao@example.invalid");
    await page.getByLabel("Senha", { exact: true }).fill("test-password-only");
    await page.locator('input[name="mode"]').evaluate((input, value) => {
      (input as HTMLInputElement).value = value;
    }, mode);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page.locator('form [role="alert"]')).toContainText("Cadastro e recuperação de senha estão desativados");
  }
});
