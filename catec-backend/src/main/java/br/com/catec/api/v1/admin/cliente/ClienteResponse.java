package br.com.catec.api.v1.admin.cliente;

import br.com.catec.domain.cliente.TipoPessoa;
import java.time.Instant;

public record ClienteResponse(
        Long id,
        TipoPessoa tipoPessoa,
        String razaoSocialOuNome,
        String nomeFantasia,
        String documento,
        String email,
        String telefone,
        String enderecoLogradouro,
        String enderecoCidade,
        String enderecoUf,
        String enderecoCep,
        String observacoes,
        Instant criadoEm,
        Instant atualizadoEm) {}
