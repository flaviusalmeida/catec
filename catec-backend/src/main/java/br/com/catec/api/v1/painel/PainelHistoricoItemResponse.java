package br.com.catec.api.v1.painel;

import java.time.Instant;

public record PainelHistoricoItemResponse(
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
