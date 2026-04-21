package br.com.catec.api.v1.projeto;

import jakarta.validation.constraints.NotNull;

public record ProjetoAssociarClienteRequest(@NotNull(message = "clienteId é obrigatório.") Long clienteId) {}
