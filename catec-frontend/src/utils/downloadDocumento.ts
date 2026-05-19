import { API_BASE_URL } from "../api/config";
import { getStoredToken } from "../api/http";

export async function downloadDocumento(documentoId: number, nomeOriginal: string): Promise<void> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/documentos/${documentoId}/conteudo`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error(`Download falhou (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeOriginal || "documento";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
