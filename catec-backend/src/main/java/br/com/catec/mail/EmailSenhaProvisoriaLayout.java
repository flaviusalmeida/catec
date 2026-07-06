package br.com.catec.mail;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

final class EmailSenhaProvisoriaLayout {

    private static final String TEMPLATE = carregarTemplate();

    private EmailSenhaProvisoriaLayout() {}

    static String render(String nomeUsuario, String email, String senha) {
        return TEMPLATE
                .replace("{{NOME_USUARIO}}", escapeHtml(nomeUsuario))
                .replace("{{EMAIL}}", escapeHtml(email))
                .replace("{{SENHA}}", escapeHtml(senha));
    }

    static String textoPlano(String nomeUsuario, String email, String senha) {
        return """
                Olá, %s,

                Sua conta foi criada com sucesso na CATEC.

                Usuário: %s
                Senha temporária: %s

                Esta é uma senha temporária. Altere-a após o primeiro acesso.

                Caso você não reconheça este cadastro, desconsidere este e-mail.

                —
                CATEC
                """
                .formatted(nomeUsuario, email, senha);
    }

    private static String carregarTemplate() {
        try (InputStream in =
                EmailSenhaProvisoriaLayout.class.getResourceAsStream("/mail/senha-provisoria.html")) {
            if (in == null) {
                throw new IllegalStateException("Template /mail/senha-provisoria.html não encontrado.");
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalStateException("Não foi possível carregar o template de e-mail.", ex);
        }
    }

    private static String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
