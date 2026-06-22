package br.com.catec.api.v1.admin.grupo;

import java.time.Instant;
import java.util.List;

public record GrupoResponse(
        Long id,
        String codigo,
        String nome,
        String descricao,
        boolean ativo,
        boolean sistema,
        List<String> permissoes,
        Instant criadoEm,
        Instant atualizadoEm) {}
