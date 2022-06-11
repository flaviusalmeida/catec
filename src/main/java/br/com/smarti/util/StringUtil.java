package br.com.smarti.util;

public class StringUtil {

    public static String removeLetras(String str) {
	return str.replaceAll("[^\\d.]", "").trim();
    }
}
