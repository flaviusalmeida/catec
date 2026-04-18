package br.com.catec.api.v1.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank @Size(max = 255) String email, @NotBlank @Size(max = 2000) String password) {}
