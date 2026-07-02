package br.com.catec.api.v1.projeto;

final class ProjetoResumoCalculator {

    private ProjetoResumoCalculator() {}

    static long calcularEstoqueHa30Dias(long estoqueAtual, long entradas30d, long saidas30d) {
        return estoqueAtual - entradas30d + saidas30d;
    }

    static double calcularVariacaoPercentual(long estoqueAtual, long estoqueHa30Dias) {
        if (estoqueHa30Dias == 0) {
            return estoqueAtual > 0 ? 100.0 : 0.0;
        }

        return ((double) (estoqueAtual - estoqueHa30Dias) / estoqueHa30Dias) * 100.0;
    }
}
