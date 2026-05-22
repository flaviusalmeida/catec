export const DEFAULT_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

const EXTENSOES_PERMITIDAS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];

const MIME_PERMITIDOS = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
]);

function extensaoArquivo(nome: string): string {
  const idx = nome.lastIndexOf(".");
  return idx >= 0 ? nome.slice(idx).toLowerCase() : "";
}

export function validarArquivoUpload(
  file: File,
  maxSizeBytes = DEFAULT_UPLOAD_MAX_BYTES,
): string | null {
  if (file.size > maxSizeBytes) {
    return "Arquivo acima do limite permitido.";
  }

  const ext = extensaoArquivo(file.name);
  const mime = (file.type || "").toLowerCase();
  const extOk = EXTENSOES_PERMITIDAS.includes(ext);
  const mimeOk = mime ? MIME_PERMITIDOS.has(mime) : extOk;

  if (!extOk && !mimeOk) {
    return "Formato inválido.";
  }

  return null;
}
