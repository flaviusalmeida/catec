package br.com.catec.security;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

/** Gera senhas provisórias (enviadas por e-mail). */
@Component
public class SenhaProvisoriaGenerator {

    private static final int TAMANHO = 8;
    private static final String ALFABETO =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*-_=+?";

    private final SecureRandom random = new SecureRandom();

    public String gerar() {
        StringBuilder sb = new StringBuilder(TAMANHO);
        for (int i = 0; i < TAMANHO; i++) {
            sb.append(ALFABETO.charAt(random.nextInt(ALFABETO.length())));
        }
        return sb.toString();
    }
}
