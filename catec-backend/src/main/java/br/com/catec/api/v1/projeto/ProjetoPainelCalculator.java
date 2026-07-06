package br.com.catec.api.v1.projeto;

import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

final class ProjetoPainelCalculator {

    private static final ZoneId ZONA = ZoneId.of("America/Sao_Paulo");

    private static final ProjetoStatus[] STATUS_EXECUCAO = {
        ProjetoStatus.AGUARDANDO_EXECUCAO, ProjetoStatus.EM_EXECUCAO
    };

    private ProjetoPainelCalculator() {}

    static boolean emFaseExecucao(ProjetoStatus status) {
        for (ProjetoStatus s : STATUS_EXECUCAO) {
            if (s == status) {
                return true;
            }
        }
        return false;
    }

    static boolean statusTerminal(ProjetoStatus status) {
        return status == ProjetoStatus.CANCELADO || status == ProjetoStatus.FINALIZADO;
    }

    /** Projeto ativo com previsão de conclusão — base para alertas de prazo. */
    static boolean elegivelAlertaPrazo(Projeto projeto) {
        return !statusTerminal(projeto.getStatus());
    }

    static AlertaPrazoProjeto calcularAlertaPrazo(Projeto projeto) {
        if (!elegivelAlertaPrazo(projeto)) {
            return null;
        }
        Instant previsao = projeto.getPrevisaoConclusaoEm();
        if (previsao == null) {
            return null;
        }
        LocalDate hoje = LocalDate.now(ZONA);
        LocalDate dataPrevisao = previsao.atZone(ZONA).toLocalDate();
        if (dataPrevisao.isBefore(hoje)) {
            return AlertaPrazoProjeto.ATRASADO;
        }
        long diasRestantes = ChronoUnit.DAYS.between(hoje, dataPrevisao);
        if (diasRestantes <= 7) {
            return AlertaPrazoProjeto.CRITICO;
        }
        if (diasRestantes <= 15) {
            return AlertaPrazoProjeto.ATENCAO;
        }
        return AlertaPrazoProjeto.OK;
    }

    static Long calcularDiasRestantes(Projeto projeto) {
        if (!elegivelAlertaPrazo(projeto) || projeto.getPrevisaoConclusaoEm() == null) {
            return null;
        }
        LocalDate hoje = LocalDate.now(ZONA);
        LocalDate dataPrevisao = projeto.getPrevisaoConclusaoEm().atZone(ZONA).toLocalDate();
        return ChronoUnit.DAYS.between(hoje, dataPrevisao);
    }

    static Integer calcularPercentualPrazoConsumido(Projeto projeto) {
        Integer prazoDias = projeto.getPrazoConclusaoDias();
        Instant previsao = projeto.getPrevisaoConclusaoEm();
        if (!elegivelAlertaPrazo(projeto) || prazoDias == null || prazoDias < 1 || previsao == null) {
            return null;
        }
        LocalDate dataPrevisao = previsao.atZone(ZONA).toLocalDate();
        LocalDate inicio = dataPrevisao.minusDays(prazoDias);
        LocalDate hoje = LocalDate.now(ZONA);
        long diasDecorridos = ChronoUnit.DAYS.between(inicio, hoje);
        if (diasDecorridos < 0) {
            return 0;
        }
        int percentual = (int) Math.round((diasDecorridos * 100.0) / prazoDias);
        return Math.min(100, Math.max(0, percentual));
    }

    /** Em fase de execução sem data calculada (contrato aceito, previsão pendente). */
    static boolean contaSemPrevisao(Projeto projeto) {
        return emFaseExecucao(projeto.getStatus()) && projeto.getPrevisaoConclusaoEm() == null;
    }

    static boolean contaAlerta(Projeto projeto, AlertaPrazoProjeto faixa) {
        AlertaPrazoProjeto alerta = calcularAlertaPrazo(projeto);
        return alerta == faixa;
    }
}
