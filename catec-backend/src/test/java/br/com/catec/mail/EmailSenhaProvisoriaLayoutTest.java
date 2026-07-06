package br.com.catec.mail;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class EmailSenhaProvisoriaLayoutTest {

    @Test
    void render_deveSubstituirPlaceholders() {
        String html = EmailSenhaProvisoriaLayout.render("Maria Silva", "maria@catec.local", "Ab12!xyZ");

        assertThat(html).contains("Maria Silva");
        assertThat(html).contains("maria@catec.local");
        assertThat(html).contains("Ab12!xyZ");
        assertThat(html).doesNotContain("{{NOME_USUARIO}}");
        assertThat(html).doesNotContain("{{EMAIL}}");
        assertThat(html).doesNotContain("{{SENHA}}");
    }

    @Test
    void render_deveEscaparHtml() {
        String html = EmailSenhaProvisoriaLayout.render("<script>", "user@test.com", "pass");

        assertThat(html).contains("&lt;script&gt;");
        assertThat(html).doesNotContain("<script>");
    }
}
