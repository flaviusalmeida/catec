package br.com.catec.api.v1.projeto;

public record ProjetoPainelAlertasPrazoResponse(
        long atrasados, long criticos7Dias, long atencao15Dias, long semPrevisao) {}
