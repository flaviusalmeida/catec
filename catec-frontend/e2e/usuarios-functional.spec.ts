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

test("crud funcional básico na tela de usuários", async ({ page }) => {
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
  ];

  await page.addInitScript(() => {
    window.localStorage.setItem("catec_token", "token-e2e");
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
    const request = route.request();
    if (request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(usuarios),
      });
      return;
    }

    if (request.method() === "POST") {
      const body = request.postDataJSON() as {
        nome: string;
        email: string;
        telefone: string | null;
        perfis: string[];
      };
      const novo: Usuario = {
        id: usuarios.length + 1,
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        ativo: false,
        requerTrocaSenha: true,
        perfis: body.perfis,
        criadoEm: agora,
        atualizadoEm: agora,
      };
      usuarios.push(novo);
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify(novo) });
      return;
    }

    await route.fallback();
  });

  await page.route("**/api/v1/admin/usuarios/*", async (route) => {
    const request = route.request();
    const match = request.url().match(/\/api\/v1\/admin\/usuarios\/(\d+)$/);
    const id = match ? Number(match[1]) : -1;
    const idx = usuarios.findIndex((u) => u.id === id);
    if (idx < 0) {
      await route.fulfill({ status: 404 });
      return;
    }

    if (request.method() === "PUT") {
      const body = request.postDataJSON() as {
        nome: string;
        email: string;
        telefone: string | null;
        ativo: boolean;
        perfis: string[];
      };
      usuarios[idx] = {
        ...usuarios[idx],
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        ativo: body.ativo,
        perfis: body.perfis,
        atualizadoEm: agora,
      };
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(usuarios[idx]) });
      return;
    }

    await route.fallback();
  });

  await page.goto("/app/usuarios");

  await expect(page.getByRole("heading", { name: "Usuários" })).toBeVisible();

  await page.getByRole("button", { name: "Novo usuário" }).click();
  await page.getByRole("dialog", { name: "Novo usuário" }).getByLabel("Nome").fill("Usuário E2E");
  await page.getByRole("dialog", { name: "Novo usuário" }).getByLabel("E-mail").fill("e2e@catec.local");
  await page.getByRole("dialog", { name: "Novo usuário" }).getByLabel("Telefone").fill("11999990000");
  await page.getByRole("dialog", { name: "Novo usuário" }).getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Usuário E2E")).toBeVisible();

  await page.getByRole("button", { name: "Editar Usuário E2E" }).click();
  await page.getByRole("dialog", { name: "Editar usuário" }).getByLabel("Nome").fill("Usuário E2E Editado");
  await page.getByRole("dialog", { name: "Editar usuário" }).getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Usuário E2E Editado")).toBeVisible();
});
