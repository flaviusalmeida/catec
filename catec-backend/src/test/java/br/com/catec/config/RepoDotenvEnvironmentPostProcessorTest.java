package br.com.catec.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

class RepoDotenvEnvironmentPostProcessorTest {

    @Test
    void parseLine_ignoraComentariosEVazios() {
        assertThat(RepoDotenvEnvironmentPostProcessor.parseLine("# comentário")).isEmpty();
        assertThat(RepoDotenvEnvironmentPostProcessor.parseLine("")).isEmpty();
    }

    @Test
    void parseLine_lêValorComAspas() {
        var entry = RepoDotenvEnvironmentPostProcessor.parseLine("SPRING_MAIL_PASSWORD=\"abcd efgh\"");
        assertThat(entry).isPresent();
        assertThat(entry.get().key()).isEqualTo("SPRING_MAIL_PASSWORD");
        assertThat(entry.get().value()).isEqualTo("abcd efgh");
    }

    @Test
    void mapSpringProperty_mapeiaCredenciaisDeEmail() {
        Map<String, Object> properties = new LinkedHashMap<>();
        RepoDotenvEnvironmentPostProcessor.putProperty(properties, "SPRING_MAIL_HOST", "smtp.gmail.com");
        RepoDotenvEnvironmentPostProcessor.putProperty(properties, "SPRING_MAIL_PASSWORD", "senha app");

        assertThat(properties.get("spring.mail.host")).isEqualTo("smtp.gmail.com");
        assertThat(properties.get("spring.mail.password")).isEqualTo("senha app");
    }
}
