package br.com.catec.api.v1.admin.grupo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record GrupoUpdateRequest(
        @NotBlank @Size(max = 120) String nome,
        @Size(max = 2000) String descricao,
        boolean ativo,
        @NotEmpty List<@NotBlank @Size(max = 80) String> permissoes) {}
