package br.com.catec.api.v1.projeto;

import java.time.Instant;

public record ProjetoHistoricoItemResponse(
        String origem,
        Long registroId,
        String tipoEntidade,
        Long entidadeId,
        String acao,
        String statusAnterior,
        String statusNovo,
        String tipoInteracao,
        String texto,
        Long documentoId,
        Long usuarioId,
        String usuarioNome,
        Instant ocorridoEm) {}
