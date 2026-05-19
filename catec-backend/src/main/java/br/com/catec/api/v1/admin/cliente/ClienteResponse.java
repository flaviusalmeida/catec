package br.com.catec.api.v1.admin.cliente;

import br.com.catec.domain.cliente.TipoPessoa;
import java.time.Instant;
import java.util.List;

public record ClienteResponse(
        Long id,
        TipoPessoa tipoPessoa,
        String razaoSocialOuNome,
        String nomeFantasia,
        String documento,
        String email,
        String telefone,
        String enderecoLogradouro,
        String enderecoNumero,
        String enderecoComplemento,
        String enderecoCidade,
        String enderecoUf,
        String enderecoCep,
        String periodoFaturamento,
        String observacoes,
        List<ClienteResponsavelResponse> responsaveis,
        Instant criadoEm,
        Instant atualizadoEm) {}
