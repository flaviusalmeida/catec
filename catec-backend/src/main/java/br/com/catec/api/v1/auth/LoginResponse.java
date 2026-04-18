package br.com.catec.api.v1.auth;

public record LoginResponse(
        String tokenType, String accessToken, long expiresInSeconds, boolean trocaSenhaObrigatoria) {}
