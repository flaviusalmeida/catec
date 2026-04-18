package br.com.catec.api.v1.admin.usuario;

import br.com.catec.domain.usuario.PerfilMacro;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UsuarioUpdateRequest(
        @NotBlank @Size(max = 255) String nome,
        @NotBlank @Email @Size(max = 255) String email,
        @Size(max = 50) String telefone,
        boolean ativo,
        @NotEmpty @NotNull List<PerfilMacro> perfis) {}
