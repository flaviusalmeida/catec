package br.com.catec.api.v1.admin.cliente;

import br.com.catec.domain.cliente.TipoPessoa;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ClienteRequest(
        @NotNull TipoPessoa tipoPessoa,
        @NotBlank @Size(max = 255) String razaoSocialOuNome,
        @Size(max = 255) String nomeFantasia,
        @Size(max = 20) String documento,
        @Email @Size(max = 255) String email,
        @Size(max = 50) String telefone,
        @Size(max = 255) String enderecoLogradouro,
        @Size(max = 120) String enderecoCidade,
        @Size(min = 2, max = 2) String enderecoUf,
        @Size(max = 10) String enderecoCep,
        @Size(max = 5000) String observacoes) {}
