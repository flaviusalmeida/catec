package br.com.catec.security;

import java.util.regex.Pattern;

/** Regras para senha definida pelo usuário (não provisória). */
public final class PoliticaSenha {

    private static final int MIN = 12;
    private static final int MAX = 128;
    private static final Pattern TEM_MAIUSCULA = Pattern.compile("[A-Z]");
    private static final Pattern TEM_MINUSCULA = Pattern.compile("[a-z]");
    private static final Pattern TEM_DIGITO = Pattern.compile("[0-9]");
    private static final Pattern TEM_ESPECIAL = Pattern.compile("[^A-Za-z0-9]");

    private PoliticaSenha() {}

    public static void validarSenhaDefinitiva(String senha) {
        if (senha == null || senha.length() < MIN || senha.length() > MAX) {
            throw new IllegalArgumentException("A senha deve ter entre " + MIN + " e " + MAX + " caracteres.");
        }
        if (!TEM_MAIUSCULA.matcher(senha).find()) {
            throw new IllegalArgumentException("A senha deve incluir pelo menos uma letra maiúscula.");
        }
        if (!TEM_MINUSCULA.matcher(senha).find()) {
            throw new IllegalArgumentException("A senha deve incluir pelo menos uma letra minúscula.");
        }
        if (!TEM_DIGITO.matcher(senha).find()) {
            throw new IllegalArgumentException("A senha deve incluir pelo menos um dígito.");
        }
        if (!TEM_ESPECIAL.matcher(senha).find()) {
            throw new IllegalArgumentException("A senha deve incluir pelo menos um caractere especial.");
        }
    }
}
