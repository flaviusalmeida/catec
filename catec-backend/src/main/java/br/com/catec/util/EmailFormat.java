package br.com.catec.util;

/** Formato de e-mail alinhado à validação Bean Validation em {@code ClienteRequest}. */
public final class EmailFormat {

    /**
     * Local com letras, números, +, _, . e - ; domínio com labels separados por ponto e TLD com ao menos 2 letras.
     */
    public static final String REGEX = "^[A-Za-z0-9+_.\\-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";

    private EmailFormat() {}
}
