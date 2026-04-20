package br.com.catec.mail;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.com.catec.config.AppMailProperties;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;

@ExtendWith(MockitoExtension.class)
class EmailNotificacaoServiceTest {

    @Mock
    private ObjectProvider<JavaMailSender> mailSenderProvider;
    @Mock
    private JavaMailSender mailSender;

    @Test
    void enviarSenhaProvisoria_quandoMailDesabilitado_naoDeveTentarEnviar() {
        var service = new EmailNotificacaoService(new AppMailProperties(false, "noreply@catec.local"), mailSenderProvider);
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);

        assertDoesNotThrow(() -> service.enviarSenhaProvisoria("user@catec.local", "User", "Senha@123"));
    }

    @Test
    void enviarSenhaProvisoria_quandoSenderIndisponivel_naoDeveFalhar() {
        var service = new EmailNotificacaoService(new AppMailProperties(true, "noreply@catec.local"), mailSenderProvider);
        when(mailSenderProvider.getIfAvailable()).thenReturn(null);

        assertDoesNotThrow(() -> service.enviarSenhaProvisoria("user@catec.local", "User", "Senha@123"));
    }

    @Test
    void enviarSenhaProvisoria_quandoMailHabilitado_deveEnviarMensagem() {
        var service = new EmailNotificacaoService(new AppMailProperties(true, "noreply@catec.local"), mailSenderProvider);
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        service.enviarSenhaProvisoria("user@catec.local", "User", "Senha@123");
        verify(mailSender).send(mimeMessage);
    }

    @Test
    void enviarSenhaProvisoria_quandoEnvioFalha_deveLancarIllegalState() {
        var service = new EmailNotificacaoService(new AppMailProperties(true, "noreply@catec.local"), mailSenderProvider);
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new RuntimeException("smtp down")).when(mailSender).send(mimeMessage);

        assertThrows(IllegalStateException.class, () -> service.enviarSenhaProvisoria("user@catec.local", "User", "Senha@123"));
    }
}
