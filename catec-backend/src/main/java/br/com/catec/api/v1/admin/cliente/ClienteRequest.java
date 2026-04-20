package br.com.catec.api.v1.admin.cliente;

import br.com.catec.domain.cliente.TipoPessoa;
import br.com.catec.util.EmailFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ClienteRequest(
        @NotNull TipoPessoa tipoPessoa,
        @NotBlank @Size(max = 255) String razaoSocialOuNome,
        @Size(max = 255) String nomeFantasia,
        @NotBlank @Size(max = 18) String documento,
        @NotBlank @Size(max = 255) @Pattern(regexp = EmailFormat.REGEX, message = "E-mail inválido.") String email,
        @NotBlank @Size(max = 20) String telefone,
        @Size(max = 255) String enderecoLogradouro,
        @Size(max = 20) String enderecoNumero,
        @Size(max = 120) String enderecoComplemento,
        @Size(max = 120) String enderecoCidade,
        @Size(min = 2, max = 2) String enderecoUf,
        @Size(max = 10) String enderecoCep,
        @Size(max = 5000) String observacoes) {}
