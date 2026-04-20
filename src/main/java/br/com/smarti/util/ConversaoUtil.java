package br.com.smarti.util;

public class ConversaoUtil {

    public static long fahrenheitToCelsius(int f) {
	return Math.round((f - 32) * 5 / 9);
    }

    public static long milhasToKm(int m) {
	return Math.round((m * 1.609));
    }

}
