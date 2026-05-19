package br.com.catec.api.v1.proposta;

import java.time.Instant;

public record PropostaPendenteSocioResponse(
        Long propostaId,
        Long projetoId,
        String projetoTitulo,
        String clienteNome,
        int versao,
        String elaboradoPorNome,
        Instant criadoEm) {}
