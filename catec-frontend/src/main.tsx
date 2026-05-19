import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthHttpBridge } from "./auth/AuthHttpBridge";
import { AuthProvider } from "./auth/AuthContext";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthHttpBridge />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
