package br.com.catec.api.v1.admin.cliente;

public record ClienteResumoCardResponse(
        ClienteResumoCardTipo tipo, long total, long totalInicioTrimestre, double variacaoPercentual) {}
