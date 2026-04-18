package br.com.catec.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.mail")
public record AppMailProperties(boolean enabled, String from) {

    public AppMailProperties {
        from = from == null || from.isBlank() ? "noreply@catec.local" : from;
    }
}
