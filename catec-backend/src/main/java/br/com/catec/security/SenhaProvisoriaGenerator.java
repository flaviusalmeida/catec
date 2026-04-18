package br.com.catec.security;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

/** Gera senhas provisórias longas e imprevisíveis (enviadas apenas por canal separado, p.ex. e-mail). */
@Component
public class SenhaProvisoriaGenerator {

    private static final String ALFABETO =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*-_=+?";

    private final SecureRandom random = new SecureRandom();

    /** Comprimento elevado para compensar ausência de verificação de complexidade no primeiro acesso. */
    public String gerar() {
        int tamanho = 24;
        StringBuilder sb = new StringBuilder(tamanho);
        for (int i = 0; i < tamanho; i++) {
            sb.append(ALFABETO.charAt(random.nextInt(ALFABETO.length())));
        }
        return sb.toString();
    }
}
