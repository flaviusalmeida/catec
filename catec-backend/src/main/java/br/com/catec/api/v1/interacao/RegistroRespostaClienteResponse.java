package br.com.catec.api.v1.interacao;

import br.com.catec.api.v1.proposta.PropostaResponse;

public record RegistroRespostaClienteResponse(InteracaoFluxoResponse interacao, PropostaResponse proposta) {}
