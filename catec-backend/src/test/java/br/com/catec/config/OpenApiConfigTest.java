package br.com.catec.config;

import static org.assertj.core.api.Assertions.assertThat;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(classes = OpenApiConfig.class)
class OpenApiConfigTest {

    @Autowired
    private OpenAPI openAPI;

    @Test
    void expoeTituloVersaoESegurancaJwt() {
        assertThat(openAPI.getInfo().getTitle()).isEqualTo("CATEC API");
        assertThat(openAPI.getInfo().getVersion()).isEqualTo("1.0.0");
        assertThat(openAPI.getComponents().getSecuritySchemes()).containsKey("bearerAuth");
        assertThat(openAPI.getSecurity()).isNotEmpty();
    }
}
