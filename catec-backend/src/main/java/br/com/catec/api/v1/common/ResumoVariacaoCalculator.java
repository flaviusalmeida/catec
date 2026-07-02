package br.com.catec.api.v1.common;

public final class ResumoVariacaoCalculator {

    private ResumoVariacaoCalculator() {}

    public static long calcularEstoqueAnterior(long estoqueAtual, long entradas, long saidas) {
        return estoqueAtual - entradas + saidas;
    }

    public static double calcularVariacaoPercentual(long estoqueAtual, long estoqueAnterior) {
        if (estoqueAnterior == 0) {
            return estoqueAtual > 0 ? 100.0 : 0.0;
        }

        return ((double) (estoqueAtual - estoqueAnterior) / estoqueAnterior) * 100.0;
    }
}
