import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/",
  "/catalogo",
  "/catalogo/primeiros-passos-em-ia",
  "/solicitar",
  "/entrar",
  "/pagina-inexistente",
];

test("páginas públicas não têm violações automáticas WCAG A/AA", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations, route + "\n" + JSON.stringify(result.violations, null, 2)).toEqual([]);
  }
});

test("respostas incluem cabeçalhos defensivos", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.headers()["referrer-policy"]).toBe("same-origin");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");
  expect(response?.headers()["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
});
