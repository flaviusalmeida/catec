package br.com.catec.api.v1.me;

import java.util.List;

public record MeResponse(
        Long id,
        String nome,
        String email,
        List<String> perfis,
        boolean ativo,
        String telefone,
        boolean requerTrocaSenha) {}
