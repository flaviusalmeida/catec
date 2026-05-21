package br.com.catec.api.v1.interacao;

import br.com.catec.api.v1.contrato.ContratoResponse;

public record RegistroInteracaoContratoResponse(InteracaoFluxoResponse interacao, ContratoResponse contrato) {}
