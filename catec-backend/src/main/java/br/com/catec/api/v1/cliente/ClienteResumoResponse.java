package br.com.catec.api.v1.cliente;

/** Resumo para autocomplete e vínculo a projeto; contato espelha o cadastro do cliente. */
public record ClienteResumoResponse(Long id, String razaoSocialOuNome, String email, String telefone) {}
