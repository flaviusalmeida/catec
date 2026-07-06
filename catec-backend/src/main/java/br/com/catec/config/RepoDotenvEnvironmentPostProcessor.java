package br.com.catec.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Carrega {@code catec-backend/.env} antes do YAML.
 * Credenciais são expostas também como {@code spring.*} / {@code app.*} para o Spring Boot bindar.
 */
public class RepoDotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final String PROPERTY_SOURCE_NAME = "catecBackendDotenv";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path dotenv = resolveDotenvFile();

        if (dotenv == null) {
            Path cwd = Path.of(System.getProperty("user.dir", ".")).toAbsolutePath().normalize();
            System.out.println(
                    "[catec] Arquivo .env não encontrado em "
                            + cwd.resolve(".env")
                            + " — copie catec-backend/.env.example para catec-backend/.env");
            return;
        }

        Map<String, Object> properties = new LinkedHashMap<>();
        try {
            for (String rawLine : Files.readAllLines(dotenv)) {
                parseLine(rawLine).ifPresent(entry -> putProperty(properties, entry.key(), entry.value()));
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Não foi possível ler " + dotenv.toAbsolutePath(), ex);
        }

        if (properties.isEmpty()) {
            return;
        }

        // .env local tem prioridade sobre variáveis vazias do SO/IDE
        environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, properties));

        String host = (String) properties.getOrDefault("spring.mail.host", properties.get("SPRING_MAIL_HOST"));
        boolean hasPassword = properties.containsKey("spring.mail.password")
                || properties.containsKey("SPRING_MAIL_PASSWORD");

        System.out.println("[catec] Carregado .env: " + dotenv.toAbsolutePath()
                + " (" + properties.size() + " propriedades, smtpHost=" + host
                + ", smtpPassword=" + (hasPassword ? "sim" : "não") + ")");
    }

    static void putProperty(Map<String, Object> properties, String key, String value) {
        properties.put(key, value);
        mapSpringProperty(properties, key, value);
    }

    static void mapSpringProperty(Map<String, Object> properties, String key, String value) {
        switch (key) {
            case "SPRING_DATASOURCE_URL" -> properties.put("spring.datasource.url", value);
            case "SPRING_DATASOURCE_USERNAME" -> properties.put("spring.datasource.username", value);
            case "SPRING_DATASOURCE_PASSWORD" -> properties.put("spring.datasource.password", value);
            case "SPRING_MAIL_HOST" -> properties.put("spring.mail.host", value);
            case "SPRING_MAIL_PORT" -> properties.put("spring.mail.port", value);
            case "SPRING_MAIL_USERNAME" -> properties.put("spring.mail.username", value);
            case "SPRING_MAIL_PASSWORD" -> properties.put("spring.mail.password", value);
            case "SPRING_MAIL_SMTP_AUTH" -> properties.put("spring.mail.properties.mail.smtp.auth", Boolean.parseBoolean(value));
            case "SPRING_MAIL_SMTP_STARTTLS" -> {
                boolean enabled = Boolean.parseBoolean(value);
                properties.put("spring.mail.properties.mail.smtp.starttls.enable", enabled);
                properties.put("spring.mail.properties.mail.smtp.starttls.required", enabled);
            }
            case "APP_MAIL_ENABLED" -> properties.put("app.mail.enabled", Boolean.parseBoolean(value));
            case "APP_MAIL_FROM" -> properties.put("app.mail.from", value);
            case "APP_FRONTEND_URL" -> properties.put("app.frontend.url", value);
            case "JWT_SECRET" -> properties.put("app.security.jwt.secret", value);
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

        String value = unquote(line.substring(separator + 1).trim());
        return java.util.Optional.of(new DotenvEntry(key, value));
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

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    record DotenvEntry(String key, String value) {}
}
