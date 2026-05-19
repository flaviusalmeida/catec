package br.com.catec.api.v1.painel;

import br.com.catec.domain.painel.FaseMacro;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.domain.proposta.PropostaStatus;
import java.time.Instant;

public record PainelProjetoResumoResponse(
        Long projetoId,
        String titulo,
        Long clienteId,
        String clienteNome,
        ProjetoStatus projetoStatus,
        FaseMacro faseMacro,
        Long propostaId,
        Integer propostaVersao,
        PropostaStatus propostaStatus,
        Instant atualizadoEm,
        Instant prazoReferencia) {}
