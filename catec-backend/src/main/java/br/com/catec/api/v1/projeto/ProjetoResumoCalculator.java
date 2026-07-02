package br.com.catec.api.v1.projeto;

import br.com.catec.api.v1.common.ResumoVariacaoCalculator;

final class ProjetoResumoCalculator {

    private ProjetoResumoCalculator() {}

    static long calcularEstoqueHa30Dias(long estoqueAtual, long entradas30d, long saidas30d) {
        return ResumoVariacaoCalculator.calcularEstoqueAnterior(estoqueAtual, entradas30d, saidas30d);
    }

    static double calcularVariacaoPercentual(long estoqueAtual, long estoqueHa30Dias) {
        return ResumoVariacaoCalculator.calcularVariacaoPercentual(estoqueAtual, estoqueHa30Dias);
    }
}
