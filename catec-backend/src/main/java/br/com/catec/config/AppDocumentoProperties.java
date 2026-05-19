package br.com.catec.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.documento")
public class AppDocumentoProperties {

    private long maxSizeBytes = 10 * 1024 * 1024;
    private List<String> allowedMimeTypes = new ArrayList<>(List.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
    private final Storage storage = new Storage();

    public long getMaxSizeBytes() {
        return maxSizeBytes;
    }

    public void setMaxSizeBytes(long maxSizeBytes) {
        this.maxSizeBytes = maxSizeBytes;
    }

    public List<String> getAllowedMimeTypes() {
        return allowedMimeTypes;
    }

    public void setAllowedMimeTypes(List<String> allowedMimeTypes) {
        this.allowedMimeTypes = allowedMimeTypes;
    }

    public Storage getStorage() {
        return storage;
    }

    public static class Storage {
        /** `local` (disco) — futuro: `s3`, `azure-blob`, etc. */
        private String type = "local";
        private final Local local = new Local();

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Local getLocal() {
            return local;
        }
    }

    public static class Local {
        private String baseDir = "./storage/documentos";

        public String getBaseDir() {
            return baseDir;
        }

        public void setBaseDir(String baseDir) {
            this.baseDir = baseDir;
        }
    }
}
