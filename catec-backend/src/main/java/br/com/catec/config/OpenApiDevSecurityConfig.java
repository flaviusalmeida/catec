package br.com.catec.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;

/** Expõe Swagger/OpenAPI sem JWT apenas no perfil {@code dev}. */
@Configuration
@Profile("dev")
public class OpenApiDevSecurityConfig {

    @Bean
    WebSecurityCustomizer openApiWebSecurityCustomizer() {
        return web -> web.ignoring()
                .requestMatchers(
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/v3/api-docs",
                        "/v3/api-docs/**");
    }
}
