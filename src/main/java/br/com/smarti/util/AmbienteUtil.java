package br.com.smarti.util;

public class AmbienteUtil {

    private static final String EVN = "PROD";

    public static boolean isProduction() {
	return EVN.equalsIgnoreCase("PROD");
    }

    public static boolean isDevelopment() {
	return EVN.equalsIgnoreCase("DEV");
    }

}
