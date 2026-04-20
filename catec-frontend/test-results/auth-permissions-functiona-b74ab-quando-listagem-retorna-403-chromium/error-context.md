# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-permissions-functional.spec.ts >> mostra erro de permissão quando listagem retorna 403
- Location: e2e\auth-permissions-functional.spec.ts:17:1

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
  3  | test("redireciona para login quando /me retorna 401", async ({ page }) => {
  4  |   await page.addInitScript(() => {
  5  |     window.localStorage.setItem("catec_token", "token-expirado");
  6  |     window.localStorage.setItem("catec_token_type", "Bearer");
  7  |   });
  8  | 
  9  |   await page.route("**/api/v1/me", async (route) => {
  10 |     await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ mensagem: "Token inválido." }) });
  11 |   });
  12 | 
  13 |   await page.goto("/app/usuarios");
  14 |   await expect(page).toHaveURL(/\/login$/);
  15 | });
  16 | 
  17 | test("mostra erro de permissão quando listagem retorna 403", async ({ page }) => {
  18 |   await page.addInitScript(() => {
  19 |     window.localStorage.setItem("catec_token", "token-colaborador");
  20 |     window.localStorage.setItem("catec_token_type", "Bearer");
  21 |   });
  22 | 
  23 |   await page.route("**/api/v1/me", async (route) => {
  24 |     await route.fulfill({
  25 |       status: 200,
  26 |       contentType: "application/json",
  27 |       body: JSON.stringify({
  28 |         id: 2,
  29 |         nome: "Colaborador",
  30 |         email: "colab@catec.local",
  31 |         perfis: ["ADMINISTRATIVO"],
  32 |         ativo: true,
  33 |         telefone: null,
  34 |         requerTrocaSenha: false,
  35 |       }),
  36 |     });
  37 |   });
  38 | 
  39 |   await page.route("**/api/v1/admin/usuarios", async (route) => {
  40 |     await route.fulfill({
  41 |       status: 403,
  42 |       contentType: "application/json",
  43 |       body: JSON.stringify({ mensagem: "Acesso negado." }),
  44 |     });
  45 |   });
  46 | 
> 47 |   await page.goto("/app/usuarios");
     |              ^ Error: page.goto: Test timeout of 30000ms exceeded.
  48 |   await expect(page.getByText("Você não tem permissão para gerenciar usuários.")).toBeVisible();
  49 | });
  50 | 
```