package br.com.catec.api.v1.common;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class ResumoVariacaoCalculatorTest {

    @Test
    void calcularEstoqueAnterior_deveAplicarFormula() {
        assertEquals(3, ResumoVariacaoCalculator.calcularEstoqueAnterior(4, 2, 1));
    }

    @Test
    void calcularVariacaoPercentual_quandoEstoqueAnteriorZero_eAtualPositivo_deve100() {
        assertEquals(100.0, ResumoVariacaoCalculator.calcularVariacaoPercentual(2, 0));
    }

    @Test
    void calcularVariacaoPercentual_quandoAmbosZero_deve0() {
        assertEquals(0.0, ResumoVariacaoCalculator.calcularVariacaoPercentual(0, 0));
    }

    @Test
    void calcularVariacaoPercentual_quandoCresceu_devePositivo() {
        assertEquals(33.333333333333336, ResumoVariacaoCalculator.calcularVariacaoPercentual(4, 3));
    }
}
