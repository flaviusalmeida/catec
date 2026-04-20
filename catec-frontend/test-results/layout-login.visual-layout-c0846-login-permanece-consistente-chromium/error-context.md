# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: layout-login.visual.spec.ts >> layout da tela de login permanece consistente
- Location: e2e\layout-login.visual.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:4173/login", waiting until "load"

```

# Test source

```ts
  1 | import { test, expect } from "@playwright/test";
  2 | 
  3 | test("layout da tela de login permanece consistente", async ({ page }) => {
> 4 |   await page.goto("/login");
    |              ^ Error: page.goto: Test timeout of 30000ms exceeded.
  5 |   await expect(page.getByRole("img", { name: "CATEC — Assessoria em engenharia" })).toBeVisible();
  6 |   await expect(page).toHaveScreenshot("login-page.png", { fullPage: true });
  7 | });
  8 | 
```