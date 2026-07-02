package br.com.catec.api.v1.proposta;

import br.com.catec.domain.proposta.PropostaStatus;
import java.time.Instant;

public record PropostaResponse(
        Long id,
        Long projetoId,
        PropostaStatus status,
        int versao,
        Long elaboradoPorId,
        String elaboradoPorNome,
        Instant enviadaClienteEm,
        Instant avaliadaSocioEm,
        Long avaliadaPorSocioId,
        boolean consideracoesPendentes,
        Instant cobrancaPropostaInicioEm,
        Instant criadoEm,
        Instant atualizadoEm) {}
