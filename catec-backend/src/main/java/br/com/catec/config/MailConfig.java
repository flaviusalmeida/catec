package br.com.catec.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
@EnableConfigurationProperties({AppMailProperties.class, AppFrontendProperties.class})
public class MailConfig {

    private static final Logger log = LoggerFactory.getLogger(MailConfig.class);

    @Bean
    @ConditionalOnProperty(prefix = "app.mail", name = "enabled", havingValue = "true")
    ApplicationRunner validarConfiguracaoMail(AppMailProperties mailProperties, Environment env) {
        return args -> {
            String host = env.getProperty("spring.mail.host");
            if (host == null || host.isBlank()) {
                log.warn(
                        "app.mail.enabled=true, mas spring.mail.host não está definido. "
                                + "Configure SPRING_MAIL_HOST em catec-backend/.env");
                return;
            }
            log.info(
                    "Envio de e-mail ativo (from={}, smtp={}:{}, auth={})",
                    mailProperties.from(),
                    host,
                    env.getProperty("spring.mail.port", "587"),
                    env.getProperty("spring.mail.properties.mail.smtp.auth", "true"));
        };
    }
}
