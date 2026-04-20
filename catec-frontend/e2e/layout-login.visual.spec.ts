import { test, expect } from "@playwright/test";

test("layout da tela de login permanece consistente", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("img", { name: "CATEC — Assessoria em engenharia" })).toBeVisible();
  await expect(page).toHaveScreenshot("login-page.png", { fullPage: true });
});
