package br.com.catec.util;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class CpfCnpjValidatorTest {

    @Test
    void cpfValido() {
        assertTrue(CpfCnpjValidator.isCpfValid("52998224725"));
    }

    @Test
    void cpfDigitosErrados() {
        assertFalse(CpfCnpjValidator.isCpfValid("52998224724"));
    }

    @Test
    void cpfRepetidoInvalido() {
        assertFalse(CpfCnpjValidator.isCpfValid("11111111111"));
    }

    @Test
    void cnpjValido() {
        assertTrue(CpfCnpjValidator.isCnpjValid("11444777000161"));
    }

    @Test
    void cnpjDigitosErrados() {
        assertFalse(CpfCnpjValidator.isCnpjValid("11444777000160"));
    }

    @Test
    void cnpjRepetidoInvalido() {
        assertFalse(CpfCnpjValidator.isCnpjValid("00000000000000"));
    }
}
