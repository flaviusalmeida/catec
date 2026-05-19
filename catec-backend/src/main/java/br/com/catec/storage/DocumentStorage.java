package br.com.catec.storage;

import java.io.InputStream;
import org.springframework.core.io.Resource;

/**
 * Abstração de armazenamento de bytes (disco local em dev; S3/blob em produção).
 * A chave é opaca — não expor caminho físico na API.
 */
public interface DocumentStorage {

    void store(String storageKey, InputStream content, long contentLength);

    Resource loadAsResource(String storageKey);

    void delete(String storageKey);
}
