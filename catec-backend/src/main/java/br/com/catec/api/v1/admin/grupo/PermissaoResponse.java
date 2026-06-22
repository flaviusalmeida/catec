package br.com.catec.api.v1.admin.grupo;

import br.com.catec.domain.acesso.TipoPermissao;

public record PermissaoResponse(
        Long id, String codigo, String nome, TipoPermissao tipo, String modulo, String descricao) {}
