package br.com.catec.mail;

import br.com.catec.config.AppMailProperties;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificacaoService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificacaoService.class);

    private final AppMailProperties mailProperties;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final Environment environment;

    public EmailNotificacaoService(
            AppMailProperties mailProperties,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            Environment environment) {
        this.mailProperties = mailProperties;
        this.mailSenderProvider = mailSenderProvider;
        this.environment = environment;
    }

    public void enviarSenhaProvisoria(String destinatario, String nomeUsuario, String senhaProvisoria) {
        String assunto = "Bem-vindo a CATEC";
        String html = EmailSenhaProvisoriaLayout.render(nomeUsuario, destinatario, senhaProvisoria);
        String textoPlano = EmailSenhaProvisoriaLayout.textoPlano(nomeUsuario, destinatario, senhaProvisoria);

        if (!podeEnviar()) {
            registrarEnvioBloqueado(destinatario, senhaProvisoria);
            return;
        }

        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailProperties.from());
            helper.setTo(destinatario);
            helper.setSubject(assunto);
            helper.setText(textoPlano, html);
            sender.send(message);
            log.info("E-mail de senha provisória enviado para {}", destinatario);
        } catch (Exception ex) {
            log.error("Falha ao enviar e-mail para {}: {}", destinatario, ex.getMessage());
            throw new IllegalStateException("Não foi possível enviar o e-mail. Verifique a configuração SMTP.", ex);
        }
    }

    private boolean podeEnviar() {
        if (!mailProperties.enabled() || mailSenderProvider.getIfAvailable() == null) {
            return false;
        }
        if (environment.acceptsProfiles(Profiles.of("dev")) && !mailProperties.allowInDev()) {
            return false;
        }
        return true;
    }

    private void registrarEnvioBloqueado(String destinatario, String senhaProvisoria) {
        if (environment.acceptsProfiles(Profiles.of("dev")) && mailProperties.enabled()) {
            log.info(
                    "[dev] E-mail bloqueado para evitar envio acidental a clientes; destinatário={} "
                            + "(defina APP_MAIL_ALLOW_IN_DEV=true no .env para testar SMTP localmente).",
                    destinatario);
        } else {
            log.info(
                    "[app.mail.enabled=false ou SMTP indisponível] E-mail não enviado; destinatário={} "
                            + "(ative APP_MAIL_ENABLED e spring.mail para envio real).",
                    destinatario);
        }
        log.debug("Senha provisória para {}: {}", destinatario, senhaProvisoria);
    }
}
