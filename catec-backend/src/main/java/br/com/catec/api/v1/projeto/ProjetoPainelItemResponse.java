package br.com.catec.api.v1.projeto;

import br.com.catec.domain.projeto.ProjetoStatus;
import java.time.Instant;

public record ProjetoPainelItemResponse(
        Long id,
        String titulo,
        String clienteNome,
        String criadoPorNome,
        ProjetoStatus status,
        Instant previsaoConclusaoEm,
        Integer prazoConclusaoDias,
        Long diasRestantes,
        AlertaPrazoProjeto alertaPrazo,
        Integer percentualPrazoConsumido,
        Instant atualizadoEm) {}
