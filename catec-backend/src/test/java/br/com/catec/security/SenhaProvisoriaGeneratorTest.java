package br.com.catec.security;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class SenhaProvisoriaGeneratorTest {

    @Test
    void gerar_deveRetornarSenhaComComprimentoEsperadoECaracteresValidos() {
        var generator = new SenhaProvisoriaGenerator();
        String senha = generator.gerar();

        assertEquals(24, senha.length());
        assertTrue(senha.matches("[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*\\-_=+?]{24}"));
    }

    @Test
    void gerar_duasChamadasDevemRetornarSenhasDiferentes() {
        var generator = new SenhaProvisoriaGenerator();
        String senha1 = generator.gerar();
        String senha2 = generator.gerar();

        assertNotEquals(senha1, senha2);
    }
}
