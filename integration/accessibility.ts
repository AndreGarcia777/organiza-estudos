import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export async function expectAccessible(page: Page, context: string) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations, context + "\n" + JSON.stringify(result.violations, null, 2)).toEqual([]);
}
