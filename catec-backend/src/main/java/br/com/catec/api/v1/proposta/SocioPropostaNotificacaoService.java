package br.com.catec.api.v1.proposta;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Placeholder de notificação (task_013): registo em log até existir {@code evento_agenda} / e-mail (Fase 3).
 */
@Service
public class SocioPropostaNotificacaoService {

    private static final Logger log = LoggerFactory.getLogger(SocioPropostaNotificacaoService.class);

    public void propostaSubmetidaParaAvaliacaoSocio(Long propostaId, Long projetoId, String projetoTitulo) {
        log.info(
                "NOTIFICACAO_SOCIO propostaId={} projetoId={} titulo=\"{}\" — aguardando parecer do sócio",
                propostaId,
                projetoId,
                projetoTitulo);
    }

    public void propostaAprovadaPeloSocio(Long propostaId, Long socioId) {
        log.info("NOTIFICACAO_SOCIO propostaId={} avaliadaPorSocioId={} — parecer positivo", propostaId, socioId);
    }

    public void propostaDevolvidaPeloSocio(Long propostaId, Long socioId, String observacao) {
        log.info(
                "NOTIFICACAO_SOCIO propostaId={} devolvidaPorSocioId={} observacao=\"{}\"",
                propostaId,
                socioId,
                observacao);
    }
}
