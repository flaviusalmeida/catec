package br.com.catec.api.v1.contrato;

import br.com.catec.domain.contrato.ContratoStatus;
import java.time.Instant;

public record ContratoResponse(
        Long id,
        Long projetoId,
        ContratoStatus status,
        Long elaboradoPorId,
        String elaboradoPorNome,
        Instant enviadoClienteEm,
        Instant aceitoClienteEm,
        Instant recusadoClienteEm,
        boolean consideracoesPendentes,
        Instant criadoEm,
        Instant atualizadoEm) {}
