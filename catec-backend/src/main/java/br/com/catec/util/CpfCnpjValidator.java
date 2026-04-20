package br.com.catec.util;

/** Validação de dígitos verificadores de CPF e CNPJ (apenas números, sem máscara). */
public final class CpfCnpjValidator {

    private static final int[] CPF_W1 = {10, 9, 8, 7, 6, 5, 4, 3, 2};
    private static final int[] CPF_W2 = {11, 10, 9, 8, 7, 6, 5, 4, 3, 2};
    private static final int[] CNPJ_W1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
    private static final int[] CNPJ_W2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

    private CpfCnpjValidator() {}

    public static boolean isCpfValid(String digits) {
        if (digits == null || digits.length() != 11 || !allNumeric(digits)) {
            return false;
        }
        if (allSameChar(digits)) {
            return false;
        }
        int v1 = mod11Digit(digits, 9, CPF_W1);
        int v2 = mod11Digit(digits, 10, CPF_W2);
        return v1 == charToDigit(digits.charAt(9)) && v2 == charToDigit(digits.charAt(10));
    }

    public static boolean isCnpjValid(String digits) {
        if (digits == null || digits.length() != 14 || !allNumeric(digits)) {
            return false;
        }
        if (allSameChar(digits)) {
            return false;
        }
        int v1 = mod11Digit(digits, 12, CNPJ_W1);
        int v2 = mod11Digit(digits, 13, CNPJ_W2);
        return v1 == charToDigit(digits.charAt(12)) && v2 == charToDigit(digits.charAt(13));
    }

    private static int mod11Digit(String digits, int length, int[] weights) {
        int sum = 0;
        for (int i = 0; i < length; i++) {
            sum += charToDigit(digits.charAt(i)) * weights[i];
        }
        int r = sum % 11;
        return r < 2 ? 0 : 11 - r;
    }

    private static boolean allNumeric(String s) {
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c < '0' || c > '9') {
                return false;
            }
        }
        return true;
    }

    private static boolean allSameChar(String s) {
        char first = s.charAt(0);
        for (int i = 1; i < s.length(); i++) {
            if (s.charAt(i) != first) {
                return false;
            }
        }
        return true;
    }

    private static int charToDigit(char c) {
        return c - '0';
    }
}
