package br.com.catec.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI catecOpenApi(@Value("${springdoc.api.version:1.0.0}") String apiVersion) {
        return new OpenAPI()
                .info(new Info()
                        .title("CATEC API")
                        .description(
                                "API REST do sistema CATEC (Fase 1). Autentique em **Auth** com `POST /api/v1/auth/login` e use o JWT no botão **Authorize**.")
                        .version(apiVersion)
                        .contact(new Contact().name("CATEC").email("dev@catec.local"))
                        .license(new License().name("Uso interno")))
                .components(new Components()
                        .addSecuritySchemes(
                                SECURITY_SCHEME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Token retornado por POST /api/v1/auth/login")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME));
    }
}
