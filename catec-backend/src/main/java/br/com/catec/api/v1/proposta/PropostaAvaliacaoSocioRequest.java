package br.com.catec.api.v1.proposta;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PropostaAvaliacaoSocioRequest(
        @NotNull Long projetoId, @Size(max = 5000) String observacao) {}
