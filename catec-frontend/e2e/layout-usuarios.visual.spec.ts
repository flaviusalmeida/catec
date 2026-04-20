import { test, expect } from "@playwright/test";

test("layout da modal de usuário permanece consistente", async ({ page }) => {
  const agora = "2026-04-20T00:00:00Z";
  await page.addInitScript(() => {
    window.localStorage.setItem("catec_token", "token-visual");
    window.localStorage.setItem("catec_token_type", "Bearer");
  });

  await page.route("**/api/v1/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 1,
        nome: "Administrador",
        email: "admin@catec.local",
        perfis: ["ADMINISTRATIVO"],
        ativo: true,
        telefone: null,
        requerTrocaSenha: false,
      }),
    });
  });

  await page.route("**/api/v1/admin/usuarios", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: 1,
          nome: "Administrador",
          email: "admin@catec.local",
          telefone: null,
          ativo: true,
          requerTrocaSenha: false,
          perfis: ["ADMINISTRATIVO"],
          criadoEm: agora,
          atualizadoEm: agora,
        },
      ]),
    });
  });

  await page.goto("/app/usuarios");
  await page.getByRole("button", { name: "Novo usuário" }).click();
  await expect(page.getByRole("dialog", { name: "Novo usuário" })).toBeVisible();
  await expect(page).toHaveScreenshot("usuarios-modal-novo.png", { fullPage: true });
});
