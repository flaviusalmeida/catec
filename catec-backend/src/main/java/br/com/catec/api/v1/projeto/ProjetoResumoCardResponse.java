package br.com.catec.api.v1.projeto;

import br.com.catec.domain.projeto.ProjetoStatus;

public record ProjetoResumoCardResponse(
        ProjetoStatus status, long total, long totalHa30Dias, double variacaoPercentual) {}
