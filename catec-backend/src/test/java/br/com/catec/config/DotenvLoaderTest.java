package br.com.catec.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class DotenvLoaderTest {

    @Test
    void parseLine_lêValorComAspas() {
        var entry = DotenvLoader.parseLine("SPRING_MAIL_PASSWORD=\"abcd efgh\"");
        assertThat(entry).isPresent();
        assertThat(entry.get().value()).isEqualTo("abcd efgh");
    }

    @Test
    void mapSpringProperty_defineHostSmtp() {
        DotenvLoader.mapSpringProperty("SPRING_MAIL_HOST", "smtp.gmail.com");
        assertThat(System.getProperty("spring.mail.host")).isEqualTo("smtp.gmail.com");
        System.clearProperty("spring.mail.host");
    }
}
