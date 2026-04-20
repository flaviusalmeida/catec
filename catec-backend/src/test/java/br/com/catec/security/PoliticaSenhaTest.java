package br.com.catec.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class PoliticaSenhaTest {

    @Test
    void validarSenhaDefinitiva_quandoValida_naoDeveLancarExcecao() {
        assertDoesNotThrow(() -> PoliticaSenha.validarSenhaDefinitiva("Senha@Definitiva123"));
    }

    @Test
    void validarSenhaDefinitiva_quandoNula_deveLancarExcecao() {
        assertThrows(IllegalArgumentException.class, () -> PoliticaSenha.validarSenhaDefinitiva(null));
    }

    @Test
    void validarSenhaDefinitiva_quandoMuitoCurta_deveLancarExcecao() {
        assertThrows(IllegalArgumentException.class, () -> PoliticaSenha.validarSenhaDefinitiva("Aa1@curta"));
    }

    @Test
    void validarSenhaDefinitiva_quandoSemMaiuscula_deveLancarExcecao() {
        assertThrows(IllegalArgumentException.class, () -> PoliticaSenha.validarSenhaDefinitiva("senha@definitiva123"));
    }

    @Test
    void validarSenhaDefinitiva_quandoSemMinuscula_deveLancarExcecao() {
        assertThrows(IllegalArgumentException.class, () -> PoliticaSenha.validarSenhaDefinitiva("SENHA@DEFINITIVA123"));
    }

    @Test
    void validarSenhaDefinitiva_quandoSemDigito_deveLancarExcecao() {
        assertThrows(IllegalArgumentException.class, () -> PoliticaSenha.validarSenhaDefinitiva("Senha@Definitiva"));
    }

    @Test
    void validarSenhaDefinitiva_quandoSemEspecial_deveLancarExcecao() {
        assertThrows(IllegalArgumentException.class, () -> PoliticaSenha.validarSenhaDefinitiva("SenhaDefinitiva123"));
    }
}
