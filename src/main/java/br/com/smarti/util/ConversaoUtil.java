package br.com.smarti.util;

public class ConversaoUtil {

    public static int fahrenheitToCelsius(int f) {
	return (f - 32) * 5 / 9;
    }

    public static int milhasToKm(int m) {
	return (int) (m * 1.609);
    }

}
