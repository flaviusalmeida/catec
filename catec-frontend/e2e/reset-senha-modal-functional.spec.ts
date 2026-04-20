import { test, expect } from "@playwright/test";

type Usuario = {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  ativo: boolean;
  requerTrocaSenha: boolean;
  perfis: string[];
  criadoEm: string;
  atualizadoEm: string;
};

test("modal de reset: cancelar nao chama endpoint e confirmar chama", async ({ page }) => {
  const agora = "2026-04-20T00:00:00Z";
  const usuarios: Usuario[] = [
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
    {
      id: 2,
      nome: "Usuario Reset",
      email: "reset@catec.local",
      telefone: null,
      ativo: true,
      requerTrocaSenha: false,
      perfis: ["COLABORADOR"],
      criadoEm: agora,
      atualizadoEm: agora,
    },
  ];

  let resetChamadas = 0;

  await page.addInitScript(() => {
    window.localStorage.setItem("catec_token", "token-e2e-reset");
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
      body: JSON.stringify(usuarios),
    });
  });

  await page.route("**/api/v1/admin/usuarios/*/resetar-senha", async (route) => {
    resetChamadas += 1;
    const idx = usuarios.findIndex((u) => u.id === 2);
    if (idx >= 0) {
      usuarios[idx] = {
        ...usuarios[idx],
        ativo: false,
        requerTrocaSenha: true,
        atualizadoEm: agora,
      };
    }
    await route.fulfill({ status: 204, body: "" });
  });

  await page.goto("/app/usuarios");
  await expect(page.getByText("Usuario Reset")).toBeVisible();

  await page.getByRole("button", { name: "Editar Usuario Reset" }).click();
  await expect(page.getByRole("dialog", { name: "Editar usuário" })).toBeVisible();

  await page.getByRole("button", { name: "Redefinir senha" }).click();
  const confirmDialog = page.getByRole("dialog", { name: "Confirmar redefinição" });
  await expect(confirmDialog).toBeVisible();
  await confirmDialog.getByRole("button", { name: "Cancelar" }).click();

  await expect(confirmDialog).not.toBeVisible();
  expect(resetChamadas).toBe(0);

  await page.getByRole("button", { name: "Redefinir senha" }).click();
  await expect(confirmDialog).toBeVisible();
  await confirmDialog.getByRole("button", { name: "Confirmar" }).click();

  await expect(page.getByText("Nova senha provisória enviada por e-mail.")).toBeVisible();
  expect(resetChamadas).toBe(1);
});
