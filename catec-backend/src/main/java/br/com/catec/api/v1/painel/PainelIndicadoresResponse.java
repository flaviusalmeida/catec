package br.com.catec.api.v1.painel;

public record PainelIndicadoresResponse(
        long projetosPendentesCliente,
        long propostasAguardandoRegistroCliente,
        long propostasAguardandoAvaliacaoSocio,
        long propostasAprovadasAguardandoEnvio,
        long propostasEmRascunho) {}
