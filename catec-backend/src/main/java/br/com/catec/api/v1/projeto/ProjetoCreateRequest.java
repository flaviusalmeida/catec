package br.com.catec.api.v1.projeto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Criação de demanda. {@code clienteId} obrigatório: deve existir em {@code cliente} (política atual sem rascunho
 * de cliente).
 */
public record ProjetoCreateRequest(
        @NotNull(message = "clienteId é obrigatório.") Long clienteId,
        @NotBlank(message = "Título é obrigatório.") @Size(max = 500) String titulo,
        @NotBlank(message = "Escopo é obrigatório.") String escopo,
        @NotBlank(message = "E-mail de contacto é obrigatório.") @Email(message = "E-mail de contacto inválido.")
                String emailContato,
        String telefoneContato) {}
