# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: layout-usuarios.visual.spec.ts >> layout da modal de usuário permanece consistente
- Location: e2e\layout-usuarios.visual.spec.ts:3:1

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  27611 pixels (ratio 0.03 of all image pixels) are different.

  Snapshot: usuarios-modal-novo.png

Call log:
  - Expect "toHaveScreenshot(usuarios-modal-novo.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 27611 pixels (ratio 0.03 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 27611 pixels (ratio 0.03 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - navigation [ref=e6]:
      - link "Início" [ref=e7] [cursor=pointer]:
        - /url: /app/inicio
        - img [ref=e8]
        - generic [ref=e11]: Início
      - link "Projetos" [ref=e12] [cursor=pointer]:
        - /url: /app/projetos
        - img [ref=e13]
        - generic [ref=e16]: Projetos
      - link "Clientes" [ref=e17] [cursor=pointer]:
        - /url: /app/clientes
        - img [ref=e18]
        - generic [ref=e21]: Clientes
      - link "Usuários" [ref=e22] [cursor=pointer]:
        - /url: /app/usuarios
        - img [ref=e23]
        - generic [ref=e28]: Usuários
    - generic [ref=e29]:
      - generic [ref=e30]:
        - paragraph [ref=e31]: Administrador
        - paragraph [ref=e32]: admin@catec.local
      - button "Sair" [ref=e33] [cursor=pointer]
  - main [ref=e34]:
    - generic [ref=e35]:
      - generic [ref=e36]:
        - generic [ref=e37]:
          - generic [ref=e38]:
            - heading "Usuários" [level=1] [ref=e39]
            - paragraph [ref=e40]: Gestão de contas internas e perfis de acesso.
          - button "Novo usuário" [active] [ref=e42] [cursor=pointer]
        - region "Filtros" [ref=e43]:
          - generic [ref=e44]:
            - heading "Filtros" [level=2] [ref=e45]
            - button "Limpar filtros" [ref=e46] [cursor=pointer]
          - generic [ref=e47]:
            - generic [ref=e48]:
              - generic [ref=e49]: Nome
              - textbox "Nome" [ref=e50]:
                - /placeholder: Buscar por nome
            - generic [ref=e51]:
              - generic [ref=e52]: E-mail
              - textbox "E-mail" [ref=e53]:
                - /placeholder: Buscar por e-mail
            - generic [ref=e54]:
              - generic [ref=e55]: Perfil
              - combobox "Perfil" [ref=e56]:
                - option "Todos" [selected]
                - option "Colaborador"
                - option "Administrativo"
                - option "Sócio"
                - option "Sala técnica"
                - option "Campo"
                - option "Financeiro"
            - generic [ref=e57]:
              - generic [ref=e58]: Status
              - combobox "Status" [ref=e59]:
                - option "Todos" [selected]
                - option "Ativo"
                - option "Inativo"
        - table [ref=e62]:
          - rowgroup [ref=e63]:
            - row "Nome E-mail Perfis Status Ações" [ref=e64]:
              - columnheader "Nome" [ref=e65]
              - columnheader "E-mail" [ref=e66]
              - columnheader "Perfis" [ref=e67]
              - columnheader "Status" [ref=e68]
              - columnheader "Ações" [ref=e69]
          - rowgroup [ref=e70]:
            - row "Administrador admin@catec.local ADMINISTRATIVO Ativo Editar Administrador" [ref=e71] [cursor=pointer]:
              - cell "Administrador" [ref=e72]
              - cell "admin@catec.local" [ref=e73]
              - cell "ADMINISTRATIVO" [ref=e74]
              - cell "Ativo" [ref=e75]:
                - generic [ref=e77]: Ativo
              - cell "Editar Administrador" [ref=e78]:
                - button "Editar Administrador" [ref=e79]:
                  - img [ref=e80]
                  - generic [ref=e83]: Editar
      - dialog "Novo usuário" [ref=e84]:
        - heading "Novo usuário" [level=2] [ref=e85]
        - region "Dados básicos" [ref=e86]:
          - heading "Dados básicos" [level=3] [ref=e87]
          - generic [ref=e88]:
            - generic [ref=e89]:
              - generic [ref=e90]: Nome
              - textbox "Nome" [ref=e91]
            - generic [ref=e92]:
              - generic [ref=e93]: E-mail
              - textbox "E-mail" [ref=e94]
          - generic [ref=e95]:
            - generic [ref=e96]: Telefone
            - textbox "Telefone" [ref=e97]
        - region "Acesso" [ref=e98]:
          - heading "Acesso" [level=3] [ref=e99]
          - paragraph [ref=e100]:
            - text: A conta é criada
            - strong [ref=e101]: inativa
            - text: . O sistema gera uma senha provisória e envia por e-mail. No primeiro acesso o usuário define uma senha forte e a conta fica ativa.
        - region "Permissões" [ref=e102]:
          - heading "Permissões" [level=3] [ref=e103]
          - generic [ref=e104]:
            - generic [ref=e105]:
              - generic [ref=e106] [cursor=pointer]:
                - checkbox "Colaborador" [checked] [ref=e107]
                - generic [ref=e108]: Colaborador
              - button "O que é o perfil Colaborador?" [ref=e109] [cursor=pointer]:
                - img [ref=e110]
            - generic [ref=e113]:
              - generic [ref=e114] [cursor=pointer]:
                - checkbox "Administrativo" [ref=e115]
                - generic [ref=e116]: Administrativo
              - button "O que é o perfil Administrativo?" [ref=e117] [cursor=pointer]:
                - img [ref=e118]
            - generic [ref=e121]:
              - generic [ref=e122] [cursor=pointer]:
                - checkbox "Sócio" [ref=e123]
                - generic [ref=e124]: Sócio
              - button "O que é o perfil Sócio?" [ref=e125] [cursor=pointer]:
                - img [ref=e126]
            - generic [ref=e129]:
              - generic [ref=e130] [cursor=pointer]:
                - checkbox "Sala técnica" [ref=e131]
                - generic [ref=e132]: Sala técnica
              - button "O que é o perfil Sala técnica?" [ref=e133] [cursor=pointer]:
                - img [ref=e134]
            - generic [ref=e137]:
              - generic [ref=e138] [cursor=pointer]:
                - checkbox "Campo" [ref=e139]
                - generic [ref=e140]: Campo
              - button "O que é o perfil Campo?" [ref=e141] [cursor=pointer]:
                - img [ref=e142]
            - generic [ref=e145]:
              - generic [ref=e146] [cursor=pointer]:
                - checkbox "Financeiro" [ref=e147]
                - generic [ref=e148]: Financeiro
              - button "O que é o perfil Financeiro?" [ref=e149] [cursor=pointer]:
                - img [ref=e150]
        - generic [ref=e153]:
          - button "Cancelar" [ref=e154] [cursor=pointer]
          - button "Salvar" [ref=e155] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("layout da modal de usuário permanece consistente", async ({ page }) => {
  4  |   const agora = "2026-04-20T00:00:00Z";
  5  |   await page.addInitScript(() => {
  6  |     window.localStorage.setItem("catec_token", "token-visual");
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
  42 |       ]),
  43 |     });
  44 |   });
  45 | 
  46 |   await page.goto("/app/usuarios");
  47 |   await page.getByRole("button", { name: "Novo usuário" }).click();
  48 |   await expect(page.getByRole("dialog", { name: "Novo usuário" })).toBeVisible();
> 49 |   await expect(page).toHaveScreenshot("usuarios-modal-novo.png", { fullPage: true });
     |                      ^ Error: expect(page).toHaveScreenshot(expected) failed
  50 | });
  51 | 
```