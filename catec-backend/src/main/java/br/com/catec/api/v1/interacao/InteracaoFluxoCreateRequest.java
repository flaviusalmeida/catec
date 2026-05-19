package br.com.catec.api.v1.interacao;

import br.com.catec.domain.interacao.TipoInteracaoFluxo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InteracaoFluxoCreateRequest(
        @NotNull TipoInteracaoFluxo tipoInteracao,
        @NotBlank @Size(max = 10000) String texto,
        Long documentoId) {}
