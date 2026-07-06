package br.com.catec.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;

/** Carrega {@code catec-backend/.env} em system properties antes do Spring Boot subir. */
public final class DotenvLoader {

    private DotenvLoader() {}

    public static void load() {
        Path dotenv = resolveDotenvFile();
        if (dotenv == null) {
            System.out.println(
                    "[catec] .env não encontrado — copie catec-backend/.env.example para catec-backend/.env");
            return;
        }

        Map<String, String> entries = new LinkedHashMap<>();
        try {
            for (String rawLine : Files.readAllLines(dotenv)) {
                parseLine(rawLine).ifPresent(entry -> entries.put(entry.key(), entry.value()));
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Não foi possível ler " + dotenv.toAbsolutePath(), ex);
        }

        int applied = 0;
        for (var entry : entries.entrySet()) {
            if (apply(entry.getKey(), entry.getValue())) {
                applied++;
            }
        }

        String host = System.getProperty("spring.mail.host", "(não definido)");
        boolean hasPassword = System.getProperty("spring.mail.password") != null
                && !System.getProperty("spring.mail.password").isBlank();

        System.out.println("[catec] .env carregado: " + dotenv.toAbsolutePath()
                + " (" + applied + " variáveis, smtp=" + host
                + ", senhaSmtp=" + (hasPassword ? "sim" : "não") + ")");
    }

    static boolean apply(String key, String value) {
        if (isSet(System.getenv(key)) || isSet(System.getProperty(key))) {
            return false;
        }

        System.setProperty(key, value);
        mapSpringProperty(key, value);
        return true;
    }

    private static boolean isSet(String value) {
        return value != null && !value.isBlank();
    }

    static void mapSpringProperty(String key, String value) {
        switch (key) {
            case "SPRING_DATASOURCE_URL" -> System.setProperty("spring.datasource.url", value);
            case "SPRING_DATASOURCE_USERNAME" -> System.setProperty("spring.datasource.username", value);
            case "SPRING_DATASOURCE_PASSWORD" -> System.setProperty("spring.datasource.password", value);
            case "SPRING_MAIL_HOST" -> System.setProperty("spring.mail.host", value);
            case "SPRING_MAIL_PORT" -> System.setProperty("spring.mail.port", value);
            case "SPRING_MAIL_USERNAME" -> System.setProperty("spring.mail.username", value);
            case "SPRING_MAIL_PASSWORD" -> System.setProperty("spring.mail.password", value);
            case "SPRING_MAIL_SMTP_AUTH" -> System.setProperty("spring.mail.properties.mail.smtp.auth", value);
            case "SPRING_MAIL_SMTP_STARTTLS" -> {
                System.setProperty("spring.mail.properties.mail.smtp.starttls.enable", value);
                System.setProperty("spring.mail.properties.mail.smtp.starttls.required", value);
            }
            case "APP_MAIL_ENABLED" -> System.setProperty("app.mail.enabled", value);
            case "APP_MAIL_ALLOW_IN_DEV" -> System.setProperty("app.mail.allow-in-dev", value);
            case "APP_MAIL_FROM" -> System.setProperty("app.mail.from", value);
            case "APP_FRONTEND_URL" -> System.setProperty("app.frontend.url", value);
            case "JWT_SECRET" -> System.setProperty("app.security.jwt.secret", value);
            default -> { }
        }
    }

    static Path resolveDotenvFile() {
        Path cwd = Path.of(System.getProperty("user.dir", ".")).toAbsolutePath().normalize();

        Path local = cwd.resolve(".env");
        if (Files.isRegularFile(local)) {
            return local;
        }

        Path monorepoBackend = cwd.resolve("catec-backend/.env");
        if (Files.isRegularFile(monorepoBackend)) {
            return monorepoBackend;
        }

        return null;
    }

    static java.util.Optional<DotenvEntry> parseLine(String rawLine) {
        String line = rawLine.trim();
        if (line.isEmpty() || line.startsWith("#")) {
            return java.util.Optional.empty();
        }

        int separator = line.indexOf('=');
        if (separator <= 0) {
            return java.util.Optional.empty();
        }

        String key = line.substring(0, separator).trim();
        if (key.isEmpty()) {
            return java.util.Optional.empty();
        }

        return java.util.Optional.of(new DotenvEntry(key, unquote(line.substring(separator + 1).trim())));
    }

    private static String unquote(String value) {
        if (value.length() >= 2) {
            char first = value.charAt(0);
            char last = value.charAt(value.length() - 1);
            if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                return value.substring(1, value.length() - 1);
            }
        }
        return value;
    }

    record DotenvEntry(String key, String value) {}
}
