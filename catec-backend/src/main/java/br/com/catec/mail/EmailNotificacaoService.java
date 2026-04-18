package br.com.catec.mail;

import br.com.catec.config.AppMailProperties;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificacaoService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificacaoService.class);

    private final AppMailProperties mailProperties;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    public EmailNotificacaoService(AppMailProperties mailProperties, ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailProperties = mailProperties;
        this.mailSenderProvider = mailSenderProvider;
    }

    public void enviarSenhaProvisoria(String destinatario, String nomeUsuario, String senhaProvisoria) {
        String assunto = "Acesso ao sistema CATEC — senha provisória";
        String texto =
                """
                Olá, %s,

                Foi criada uma conta para o seu e-mail no sistema CATEC.

                Senha provisória (use no primeiro acesso e altere em seguida):
                %s

                No primeiro acesso será obrigatório definir uma nova senha forte.

                Se você não reconhece esta solicitação, ignore este e-mail.

                —
                CATEC
                """
                        .formatted(nomeUsuario, senhaProvisoria);

        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (mailProperties.enabled() && sender != null) {
            try {
                MimeMessage message = sender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(mailProperties.from());
                helper.setTo(destinatario);
                helper.setSubject(assunto);
                helper.setText(texto, false);
                sender.send(message);
                log.info("E-mail de senha provisória enviado para {}", destinatario);
            } catch (Exception ex) {
                log.error("Falha ao enviar e-mail para {}: {}", destinatario, ex.getMessage());
                throw new IllegalStateException("Não foi possível enviar o e-mail. Verifique a configuração SMTP.", ex);
            }
        } else {
            log.info(
                    "[app.mail.enabled=false ou SMTP indisponível] E-mail não enviado; destinatário={} (ative APP_MAIL_ENABLED e spring.mail para envio real).",
                    destinatario);
            log.debug("Senha provisória para {}: {}", destinatario, senhaProvisoria);
        }
    }
}
