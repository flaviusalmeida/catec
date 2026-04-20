package br.com.smarti.exceptions;

public class SeleniumException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public SeleniumException(String msg) {
	super(msg);
    }

    public SeleniumException(String msg, Throwable cause) {
	super(msg, cause);
    }

    public SeleniumException(String msg, String error, Throwable cause) {
	super(msg + " Erro: " + error, cause);
    }

}
