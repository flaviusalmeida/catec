package br.com.catec.api.v1.projeto;

import br.com.catec.domain.projeto.ProjetoStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * Atualização completa (PUT). {@code status} nulo = manter estado. Colaborador: só dados, sem mudar estado ou
 * cliente; administrativo: pode alterar cliente e estado conforme regras de transição.
 */
public record ProjetoUpdateRequest(
        Long clienteId,
        @Size(max = 500) String titulo,
        String escopo,
        @Email(message = "E-mail de contacto inválido.") String emailContato,
        String telefoneContato,
        ProjetoStatus status) {}
