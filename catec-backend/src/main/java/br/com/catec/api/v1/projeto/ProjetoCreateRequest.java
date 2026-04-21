package br.com.catec.api.v1.projeto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Criação de demanda. {@code clienteId} opcional: se omitido, a demanda fica em {@code PENDENTE_CLIENTE} até
 * associar um cliente. Com cliente, e-mail e telefone são copiados do cadastro no momento em que a demanda é salva.
 */
public record ProjetoCreateRequest(
        Long clienteId,
        @NotBlank(message = "Título é obrigatório.") @Size(max = 500) String titulo,
        @NotBlank(message = "Escopo é obrigatório.") String escopo) {}
