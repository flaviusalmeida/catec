package br.com.catec.api.v1.admin.usuario;

import java.time.Instant;
import java.util.List;

public record AdminUsuarioResponse(
        Long id,
        String nome,
        String email,
        String telefone,
        boolean ativo,
        boolean requerTrocaSenha,
        List<String> perfis,
        Instant criadoEm,
        Instant atualizadoEm) {}
