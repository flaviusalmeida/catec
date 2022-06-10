package br.com.smarti.exceptions;

public class DownloadException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public DownloadException(String msg) {
	super(msg);
    }

    public DownloadException(String msg, Throwable cause) {
	super(msg, cause);
    }

}
