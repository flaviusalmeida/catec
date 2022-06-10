package br.com.smarti.util;

import java.io.File;

import org.apache.commons.io.FileUtils;

import br.com.smarti.exceptions.ArquivoException;

public class ArquivoUtil {

    public static File escreverArquivo(StringBuilder result) {
	try {
	    File file = new File("file.csv");

	    byte bytes[] = result.toString().getBytes();
	    FileUtils.writeByteArrayToFile(file, bytes);
	    return file;
	} catch (Exception e) {
	    throw new ArquivoException("Erro ao escrever arquivo.");
	}
    }
}
