package br.com.catec.api.v1.documento;

import br.com.catec.domain.documento.TipoVinculoDocumento;
import java.time.Instant;

public record DocumentoResponse(
        Long id,
        TipoVinculoDocumento tipoVinculo,
        Long vinculoId,
        String tipoArquivo,
        String nomeOriginal,
        String mimeType,
        long tamanhoBytes,
        int versao,
        Long uploadedPorId,
        String uploadedPorNome,
        Instant criadoEm) {}
