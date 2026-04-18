package br.com.catec.api.v1.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NovaSenhaRequest(
        @NotBlank @Size(min = 12, max = 128) String senhaNova) {}
