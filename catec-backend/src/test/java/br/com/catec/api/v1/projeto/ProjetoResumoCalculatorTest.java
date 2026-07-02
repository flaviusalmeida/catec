package br.com.catec.api.v1.projeto;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class ProjetoResumoCalculatorTest {

    @Test
    void calcularEstoqueHa30Dias_deveAplicarFormula() {
        assertEquals(3, ProjetoResumoCalculator.calcularEstoqueHa30Dias(4, 2, 1));
    }

    @Test
    void calcularVariacaoPercentual_quandoEstoqueAnteriorZero_eAtualPositivo_deve100() {
        assertEquals(100.0, ProjetoResumoCalculator.calcularVariacaoPercentual(2, 0));
    }

    @Test
    void calcularVariacaoPercentual_quandoAmbosZero_deve0() {
        assertEquals(0.0, ProjetoResumoCalculator.calcularVariacaoPercentual(0, 0));
    }

    @Test
    void calcularVariacaoPercentual_quandoCresceu_devePositivo() {
        assertEquals(33.333333333333336, ProjetoResumoCalculator.calcularVariacaoPercentual(4, 3));
    }

    @Test
    void calcularVariacaoPercentual_quandoCaiu_deveNegativo() {
        assertEquals(-50.0, ProjetoResumoCalculator.calcularVariacaoPercentual(1, 2));
    }
}
