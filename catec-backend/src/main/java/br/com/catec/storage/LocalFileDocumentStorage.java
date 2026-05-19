package br.com.catec.storage;

import br.com.catec.config.AppDocumentoProperties;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
@ConditionalOnProperty(name = "app.documento.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileDocumentStorage implements DocumentStorage {

    private final Path baseDir;

    public LocalFileDocumentStorage(AppDocumentoProperties properties) {
        this.baseDir = Path.of(properties.getStorage().getLocal().getBaseDir()).toAbsolutePath().normalize();
    }

    @Override
    public void store(String storageKey, InputStream content, long contentLength) {
        Path target = resolve(storageKey);
        try {
            Files.createDirectories(target.getParent());
            Files.copy(content, target);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao gravar arquivo no storage.");
        }
    }

    @Override
    public Resource loadAsResource(String storageKey) {
        Path file = resolve(storageKey);
        if (!Files.isRegularFile(file)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo não encontrado no storage.");
        }
        return new FileSystemResource(file);
    }

    @Override
    public void delete(String storageKey) {
        Path file = resolve(storageKey);
        try {
            Files.deleteIfExists(file);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao remover arquivo do storage.");
        }
    }

    private Path resolve(String storageKey) {
        Path resolved = baseDir.resolve(storageKey).normalize();
        if (!resolved.startsWith(baseDir)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chave de storage inválida.");
        }
        return resolved;
    }
}
