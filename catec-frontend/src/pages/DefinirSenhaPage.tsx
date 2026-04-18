import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import "./LoginPage.css";

type LoginResponse = {
  tokenType: string;
  accessToken: string;
  expiresInSeconds: number;
  trocaSenhaObrigatoria: boolean;
};

type ApiErrorBody = {
  status?: number;
  mensagem?: string;
};

export default function DefinirSenhaPage() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (senha !== confirmacao) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/auth/trocar-senha", {
        method: "POST",
        body: JSON.stringify({ senhaNova: senha }),
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
            : `Erro (${res.status})`;
        setError(msg);
        return;
      }
      const login = data as LoginResponse;
      if (login?.accessToken) {
        await loginWithToken(login.accessToken);
        navigate("/app/inicio", { replace: true });
        return;
      }
      setError("Resposta inválida do servidor.");
    } catch {
      setError("Não foi possível contatar o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page-inner">
        <div className="login-card">
          <img className="login-logo" src="/logo-catec.png" alt="CATEC — Assessoria em engenharia" />

          <h1 className="login-definir-titulo">Definir senha</h1>
          <p className="login-definir-texto">
            É necessário escolher uma senha forte antes de continuar: pelo menos 12 caracteres, com maiúsculas,
            minúsculas, um dígito e um símbolo.
          </p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="login-label" htmlFor="nova-senha">
              Nova senha
            </label>
            <input
              id="nova-senha"
              name="nova-senha"
              type="password"
              className="login-input"
              autoComplete="new-password"
              value={senha}
              onChange={(ev) => setSenha(ev.target.value)}
              required
              minLength={12}
              disabled={loading}
            />

            <label className="login-label" htmlFor="confirmar-senha">
              Confirmar
            </label>
            <input
              id="confirmar-senha"
              name="confirmar-senha"
              type="password"
              className="login-input"
              autoComplete="new-password"
              value={confirmacao}
              onChange={(ev) => setConfirmacao(ev.target.value)}
              required
              minLength={12}
              disabled={loading}
            />

            {error ? (
              <div className="login-alert login-alert--error" role="alert">
                {error}
              </div>
            ) : null}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Salvando…" : "Salvar e continuar"}
            </button>
          </form>
        </div>
        <footer className="login-footer">© {new Date().getFullYear()} CATEC</footer>
      </div>
    </div>
  );
}
