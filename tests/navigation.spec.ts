import { expect, test } from "@playwright/test";
import { demoMaterials, normalizeSearch, safeExternalUrl } from "../src/data/demo-materials";

test("navegação, teclado e layout responsivo", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Pular para o conteúdo" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page.getByRole("link", { name: "Explorar materiais" }).click();
  await expect(page).toHaveURL(/\/catalogo$/);
  await expect(page.getByRole("heading", { name: "8 materiais encontrados" })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Catálogo", exact: true })).toHaveAttribute("aria-current", "page");
  for (const route of ["/", "/catalogo", "/catalogo/primeiros-passos-em-ia", "/solicitar"]) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), route).toBe(false);
  }
  await page.setViewportSize({ width: 320, height: 740 });
  for (const route of ["/catalogo", "/catalogo/primeiros-passos-em-ia", "/solicitar"]) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), route).toBe(false);
  }
  const response = await page.goto("/pagina-inexistente");
  expect(response?.status()).toBe(404);
  await page.getByRole("link", { name: "Voltar ao início" }).click();
  await expect(page).toHaveURL("/");
  expect(errors).toEqual([]);
});

test("busca sem acentos, filtros combinados, recarga e limpeza", async ({ page }) => {
  await page.goto("/catalogo");
  await page.getByRole("searchbox").fill("etica");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page.getByRole("heading", { name: "1 material encontrado", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ética e vieses em sistemas de IA" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("searchbox")).toHaveValue("etica");
  await page.getByRole("link", { name: "Limpar filtros", exact: true }).click();
  await expect(page).toHaveURL(/\/catalogo$/);
  await expect(page.getByRole("heading", { name: "8 materiais encontrados", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Tópico", exact: true }).selectOption("Redes neurais");
  await page.getByRole("combobox", { name: "Nível", exact: true }).selectOption("Iniciante");
  await page.getByRole("combobox", { name: "Formato", exact: true }).selectOption("Vídeo");
  await page.getByRole("combobox", { name: "Custo do material", exact: true }).selectOption("Gratuito");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page.getByRole("heading", { name: "1 material encontrado", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Redes neurais: uma explicação visual" })).toBeVisible();
  await page.getByRole("combobox", { name: "Custo do material", exact: true }).selectOption("Pago");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page.getByRole("heading", { name: "Nenhum material com esses filtros." })).toBeVisible();
  await page.getByRole("link", { name: "Ver todos os materiais" }).click();
  await expect(page.locator(".material-card")).toHaveCount(8);
  for (const name of ["Tópico", "Nível", "Formato", "Custo do material"]) {
    await expect(page.getByRole("combobox", { name, exact: true })).toHaveValue("");
  }
  await page.getByRole("combobox", { name: "Custo do material", exact: true }).selectOption("Parcialmente gratuito");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page.getByRole("heading", { name: "Aprendizado supervisionado na prática" })).toBeVisible();
  await expect(page.locator(".material-card")).toHaveCount(1);
  await page.goto("/catalogo?formato=inexistente&q=teste");
  await expect(page.getByRole("heading", { name: "Nenhum material com esses filtros." })).toBeVisible();
});

test("detalhes, dados ausentes, links seguros e avaliações honestas", async ({ page }) => {
  await page.goto("/catalogo");
  await page.getByRole("link", { name: "Ver detalhes de Primeiros passos em inteligência artificial", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Primeiros passos em inteligência artificial");
  await expect(page.getByRole("navigation").getByRole("link", { name: "Catálogo", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".material-facts dl > div").filter({ hasText: "Duração do conteúdo" })).toContainText("Não informado");
  await expect(page.locator(".material-facts dl > div").filter({ hasText: "Estimativa de estudo" })).toContainText("1 a 2 horas");
  const external = page.getByRole("link", { name: "Abrir endereço de exemplo" });
  await expect(external).toHaveAttribute("href", "https://example.com/#primeiros-passos-em-ia");
  await expect(external).toHaveAttribute("target", "_blank");
  await expect(external).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByText("Ainda não há avaliações aprovadas para este exemplo.")).toBeVisible();
  await expect(page.getByText("Comentário ilustrativo da curadoria. Não é avaliação nem experiência de estudante.")).toBeVisible();
  await page.goto("/catalogo/linguagem-e-modelos");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Do texto aos modelos de linguagem");
  await expect(page.getByRole("link", { name: "Abrir endereço de exemplo" })).toHaveCount(0);
  await page.goto("/catalogo/nao-existe");
  await expect(page.getByRole("heading", { name: "Este exemplo não está no catálogo." })).toBeVisible();
});

test("todos os exemplos têm páginas navegáveis", async ({ page }) => {
  for (const material of demoMaterials) {
    const response = await page.goto(`/catalogo/${material.slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(material.title);
    await expect(page.locator(".demo-callout")).toContainText("dados fictícios");
  }
});

test("simulação valida campos sem pedido, contato ou persistência", async ({ page }) => {
  await page.goto("/solicitar");
  const button = page.getByRole("button", { name: "Simular preenchimento" });
  await expect(button).toBeEnabled();
  await button.click();
  await expect(page.locator("form select:invalid").first()).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
  await page.getByRole("combobox", { name: "Disciplina de exemplo", exact: true }).selectOption("Introdução à inteligência artificial");
  await page.getByRole("combobox", { name: "Tópico de exemplo", exact: true }).selectOption("Redes neurais");
  await page.getByRole("combobox", { name: "Objetivo", exact: true }).selectOption("revisão para prova");
  await page.getByRole("combobox", { name: "Nível de conhecimento", exact: true }).selectOption("Iniciante");
  await page.getByRole("spinbutton", { name: "Horas disponíveis para estudar" }).fill("0");
  await button.click();
  await expect(page.locator('input[name="hours"]:invalid')).toBeVisible();
  await page.getByRole("spinbutton", { name: "Horas disponíveis para estudar" }).fill("6");
  const mutations: string[] = [];
  page.on("request", (request) => { if (!["GET", "HEAD"].includes(request.method())) mutations.push(request.url()); });
  await button.click();
  await expect(page.getByRole("status")).toContainText("nenhum pedido foi enviado");
  await expect(page.getByRole("status")).toContainText("6 horas");
  await expect(page.getByRole("status")).toBeFocused();
  expect(mutations).toEqual([]);
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  await expect(page.locator('input[type="email"], input[type="tel"], textarea')).toHaveCount(0);
  await page.getByRole("button", { name: "Limpar simulação" }).click();
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.getByRole("spinbutton", { name: "Horas disponíveis para estudar" })).toHaveValue("");
  await page.reload();
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.getByRole("spinbutton", { name: "Horas disponíveis para estudar" })).toHaveValue("");
});

test("protocolos externos e busca são tratados com segurança", () => {
  expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
  expect(safeExternalUrl("data:text/html,oi")).toBeNull();
  expect(safeExternalUrl("//example.com")).toBeNull();
  expect(safeExternalUrl(null)).toBeNull();
  expect(safeExternalUrl("https://example.com")).toBe("https://example.com/");
  expect(normalizeSearch("  ÉTICA EM IA  ")).toBe("etica em ia");
});

test("demonstração não coleta credenciais nem libera áreas privadas", async ({ page }) => {
  for (const route of ["/entrar", "/cadastrar", "/recuperar-senha", "/redefinir-senha", "/conta", "/admin"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: "Contas indisponíveis na demonstração" })).toBeVisible();
    await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(0);
  }
  await page.goto("/auth/callback?next=https://example.com&code=invalido");
  await expect(page).toHaveURL(/\/entrar\?erro=confirmacao$/);
  await page.goto("/auth/confirm?type=recovery&token_hash=invalido&next=//example.com");
  await expect(page).toHaveURL(/\/entrar\?erro=confirmacao$/);
});

test("destinos e credenciais têm validação restrita", async () => {
  const { safeNext, validEmail, validPassword } = await import("../src/lib/auth/validation");
  expect(safeNext("https://example.com")).toBe("/conta");
  expect(safeNext("//example.com")).toBe("/conta");
  expect(safeNext("/solicitar")).toBe("/solicitar");
  expect(validEmail("invalido")).toBe(false);
  expect(validEmail("teste@example.invalid")).toBe(true);
  expect(validPassword("curta")).toBe(false);
  expect(validPassword("x".repeat(129))).toBe(false);
  expect(validPassword("x".repeat(12))).toBe(true);
});
