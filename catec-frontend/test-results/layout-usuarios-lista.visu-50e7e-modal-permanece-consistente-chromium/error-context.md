# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: layout-usuarios-lista.visual.spec.ts >> layout da tela de usuários sem modal permanece consistente
- Location: e2e\layout-usuarios-lista.visual.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:4173/app/usuarios", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("layout da tela de usuários sem modal permanece consistente", async ({ page }) => {
  4  |   const agora = "2026-04-20T00:00:00Z";
  5  |   await page.addInitScript(() => {
  6  |     window.localStorage.setItem("catec_token", "token-visual-lista");
  7  |     window.localStorage.setItem("catec_token_type", "Bearer");
  8  |   });
  9  | 
  10 |   await page.route("**/api/v1/me", async (route) => {
  11 |     await route.fulfill({
  12 |       status: 200,
  13 |       contentType: "application/json",
  14 |       body: JSON.stringify({
  15 |         id: 1,
  16 |         nome: "Administrador",
  17 |         email: "admin@catec.local",
  18 |         perfis: ["ADMINISTRATIVO"],
  19 |         ativo: true,
  20 |         telefone: null,
  21 |         requerTrocaSenha: false,
  22 |       }),
  23 |     });
  24 |   });
  25 | 
  26 |   await page.route("**/api/v1/admin/usuarios", async (route) => {
  27 |     await route.fulfill({
  28 |       status: 200,
  29 |       contentType: "application/json",
  30 |       body: JSON.stringify([
  31 |         {
  32 |           id: 1,
  33 |           nome: "Administrador",
  34 |           email: "admin@catec.local",
  35 |           telefone: null,
  36 |           ativo: true,
  37 |           requerTrocaSenha: false,
  38 |           perfis: ["ADMINISTRATIVO"],
  39 |           criadoEm: agora,
  40 |           atualizadoEm: agora,
  41 |         },
  42 |         {
  43 |           id: 2,
  44 |           nome: "Colaborador Operacional",
  45 |           email: "colab@catec.local",
  46 |           telefone: "11999990000",
  47 |           ativo: true,
  48 |           requerTrocaSenha: false,
  49 |           perfis: ["COLABORADOR"],
  50 |           criadoEm: agora,
  51 |           atualizadoEm: agora,
  52 |         },
  53 |       ]),
  54 |     });
  55 |   });
  56 | 
> 57 |   await page.goto("/app/usuarios");
     |              ^ Error: page.goto: Test timeout of 30000ms exceeded.
  58 |   await expect(page.getByRole("heading", { name: "Usuários" })).toBeVisible();
  59 |   await expect(page).toHaveScreenshot("usuarios-lista.png", { fullPage: true });
  60 | });
  61 | 
```