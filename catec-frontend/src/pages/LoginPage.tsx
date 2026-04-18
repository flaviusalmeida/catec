import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/config";
import { useAuth } from "../auth/AuthContext";
import "./LoginPage.css";

type LoginResponse = {
  tokenType: string;
  accessToken: string;
  expiresInSeconds: number;
  trocaSenhaObrigatoria?: boolean;
};

type ApiErrorBody = {
  status?: number;
  mensagem?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const text = await res.text();
      let data: unknown = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }
      if (!res.ok) {
        const msg =
          data && typeof data === "object" && "mensagem" in data
            ? String((data as ApiErrorBody).mensagem)
            : `Erro ao entrar (${res.status})`;
        setError(msg);
        return;
      }
      const login = data as LoginResponse;
      if (login?.accessToken) {
        await loginWithToken(login.accessToken);
        if (login.trocaSenhaObrigatoria === true) {
          navigate("/definir-senha", { replace: true });
        } else {
          navigate("/app/inicio", { replace: true });
        }
        return;
      }
      setError("Resposta de login sem token.");
    } catch {
      setError("Não foi possível contatar o servidor. Verifique se a API está em execução.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page-inner">
        <div className="login-card">
          <img
            className="login-logo"
            src="/logo-catec.png"
            alt="CATEC — Assessoria em engenharia"
          />

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="login-label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="login-input"
              autoComplete="username"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              required
              disabled={loading}
            />

            <label className="login-label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="login-input"
              autoComplete="current-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
              disabled={loading}
            />

            {error ? (
              <div className="login-alert login-alert--error" role="alert">
                {error}
              </div>
            ) : null}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
        <footer className="login-footer">© {new Date().getFullYear()} CATEC</footer>
      </div>
    </div>
  );
}
