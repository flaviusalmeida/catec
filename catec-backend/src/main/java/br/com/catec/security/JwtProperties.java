package br.com.catec.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(String secret, int expirationMinutes) {

    public JwtProperties {
        if (expirationMinutes <= 0) {
            expirationMinutes = 480;
        }
    }
}
