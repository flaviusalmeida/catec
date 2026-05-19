import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUnauthorizedHandler } from "../api/http";
import { useAuth } from "./AuthContext";

/** Liga o cliente HTTP ao logout e redireccionamento quando a API responde 401. */
export function AuthHttpBridge() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      logout();
      navigate("/login", { replace: true });
    });
    return () => registerUnauthorizedHandler(null);
  }, [logout, navigate]);

  return null;
}
