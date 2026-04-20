import { test, expect } from "@playwright/test";

test("redireciona para login quando /me retorna 401", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("catec_token", "token-expirado");
    window.localStorage.setItem("catec_token_type", "Bearer");
  });

  await page.route("**/api/v1/me", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ mensagem: "Token inválido." }) });
  });

  await page.goto("/app/usuarios");
  await expect(page).toHaveURL(/\/login$/);
});

test("mostra erro de permissão quando listagem retorna 403", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("catec_token", "token-colaborador");
    window.localStorage.setItem("catec_token_type", "Bearer");
  });

  await page.route("**/api/v1/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 2,
        nome: "Colaborador",
        email: "colab@catec.local",
        perfis: ["ADMINISTRATIVO"],
        ativo: true,
        telefone: null,
        requerTrocaSenha: false,
      }),
    });
  });

  await page.route("**/api/v1/admin/usuarios", async (route) => {
    await route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({ mensagem: "Acesso negado." }),
    });
  });

  await page.goto("/app/usuarios");
  await expect(page.getByText("Você não tem permissão para gerenciar usuários.")).toBeVisible();
});
