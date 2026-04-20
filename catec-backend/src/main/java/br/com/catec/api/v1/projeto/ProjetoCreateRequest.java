package br.com.catec.api.v1.projeto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Criação de demanda. {@code clienteId} obrigatório: deve existir em {@code cliente}. E-mail e telefone da demanda
 * são copiados do cadastro do cliente no momento em que a demanda é salva.
 */
public record ProjetoCreateRequest(
        @NotNull(message = "clienteId é obrigatório.") Long clienteId,
        @NotBlank(message = "Título é obrigatório.") @Size(max = 500) String titulo,
        @NotBlank(message = "Escopo é obrigatório.") String escopo) {}
