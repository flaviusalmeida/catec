import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch, registerUnauthorizedHandler } from "./http";

const TOKEN_KEY = "catec_token";

describe("apiFetch", () => {
  beforeEach(() => {
    localStorage.clear();
    registerUnauthorizedHandler(null);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("envia Authorization Bearer quando há token", async () => {
    localStorage.setItem(TOKEN_KEY, "jwt-test");
    vi.mocked(fetch).mockResolvedValue(new Response("{}", { status: 200 }));

    await apiFetch("/api/v1/me");

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect((init?.headers as Headers).get("Authorization")).toBe("Bearer jwt-test");
  });

  it("em 401 limpa token e chama handler registado", async () => {
    localStorage.setItem(TOKEN_KEY, "expired");
    const on401 = vi.fn();
    registerUnauthorizedHandler(on401);
    vi.mocked(fetch).mockResolvedValue(new Response("{}", { status: 401 }));

    await apiFetch("/api/v1/projetos");

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(on401).toHaveBeenCalledOnce();
  });

  it("em 401 no login não dispara handler global", async () => {
    const on401 = vi.fn();
    registerUnauthorizedHandler(on401);
    vi.mocked(fetch).mockResolvedValue(new Response("{}", { status: 401 }));

    await apiFetch("/api/v1/auth/login", { method: "POST" });

    expect(on401).not.toHaveBeenCalled();
  });
});
