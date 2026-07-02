package br.com.catec.api.v1.proposta;

import jakarta.validation.constraints.Size;

public record PropostaParecerRequest(@Size(max = 5000) String observacao) {}
