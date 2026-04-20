package br.com.smarti.exceptions;

public class FileException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public FileException(String msg) {
	super(msg);
    }

    public FileException(String msg, Throwable cause) {
	super(msg, cause);
    }

    public FileException(String msg, String error, Throwable cause) {
	super(msg + " Erro: " + error, cause);
    }

}
