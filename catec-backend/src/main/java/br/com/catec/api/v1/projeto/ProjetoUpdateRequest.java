package br.com.catec.api.v1.projeto;

import br.com.catec.domain.projeto.ProjetoStatus;
import jakarta.validation.constraints.Size;

/**
 * Atualização (PUT). {@code status} nulo = manter estado. Colaborador: só título/escopo; administrativo: pode alterar
 * cliente e estado. O contato do projeto é sempre resincronizado a partir do cliente vinculado ao salvar.
 */
public record ProjetoUpdateRequest(Long clienteId, @Size(max = 500) String titulo, String escopo, ProjetoStatus status) {}
