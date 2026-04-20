package br.com.catec.api.v1.projeto;

import br.com.catec.domain.projeto.ProjetoStatus;
import java.time.Instant;

public record ProjetoResponse(
        Long id,
        Long clienteId,
        String clienteNome,
        String titulo,
        String escopo,
        String emailContato,
        String telefoneContato,
        Long criadoPorId,
        String criadoPorNome,
        ProjetoStatus status,
        Instant criadoEm,
        Instant atualizadoEm) {}
