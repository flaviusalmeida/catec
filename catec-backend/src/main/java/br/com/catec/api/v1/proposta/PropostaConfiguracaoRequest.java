package br.com.catec.api.v1.proposta;

import jakarta.validation.constraints.NotNull;

public record PropostaConfiguracaoRequest(@NotNull Boolean requerAvaliacaoSocio) {}
