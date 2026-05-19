package br.com.catec.api.v1.admin.cliente;

import br.com.catec.util.EmailFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ClienteResponsavelRequest(
        @NotBlank @Size(max = 255) String nome,
        @NotBlank @Size(max = 255) @Pattern(regexp = EmailFormat.REGEX, message = "E-mail inválido.") String email,
        @NotBlank @Size(max = 20) String telefone) {}
