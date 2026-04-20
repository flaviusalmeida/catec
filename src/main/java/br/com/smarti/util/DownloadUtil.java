package br.com.smarti.util;

import java.io.File;
import java.io.FileInputStream;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import br.com.smarti.exceptions.DownloadException;

public class DownloadUtil {

    public static ResponseEntity<InputStreamResource> preparaDownload(File dados, String nomeArquivo) {

	try {
	    InputStreamResource resource = new InputStreamResource(new FileInputStream(dados));

	    return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + nomeArquivo)
		    .contentType(MediaType.APPLICATION_OCTET_STREAM).contentLength(dados.length()).body(resource);
	} catch (Exception e) {
	    throw new DownloadException("Falha ao tentar preparar o aquivo para download.");
	}
    }

}
