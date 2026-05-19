package br.com.catec.api.v1.interacao;

import br.com.catec.domain.interacao.TipoInteracaoFluxo;
import java.time.Instant;

public record InteracaoFluxoResponse(
        Long id,
        TipoInteracaoFluxo tipoInteracao,
        String texto,
        Long registradoPorId,
        String registradoPorNome,
        Long documentoId,
        Instant criadoEm) {}
