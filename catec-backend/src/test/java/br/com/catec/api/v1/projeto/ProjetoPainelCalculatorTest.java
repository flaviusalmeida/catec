package br.com.catec.api.v1.projeto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoStatus;
import java.time.LocalDate;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;

class ProjetoPainelCalculatorTest {

    private static final ZoneId ZONA = ZoneId.of("America/Sao_Paulo");

    @Test
    void calcularAlertaPrazo_projetoAtivoComPrevisaoVencida_deveAtrasado() {
        LocalDate hoje = LocalDate.now(ZONA);
        Projeto projeto = projeto(ProjetoStatus.AGUARDANDO_EXECUCAO, hoje.minusDays(2));

        assertEquals(AlertaPrazoProjeto.ATRASADO, ProjetoPainelCalculator.calcularAlertaPrazo(projeto));
    }

    @Test
    void calcularAlertaPrazo_projetoAtivoForaDeExecucaoComPrevisao_deveContarAtencao() {
        LocalDate hoje = LocalDate.now(ZONA);
        Projeto projeto = projeto(ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL, hoje.plusDays(14));

        assertEquals(AlertaPrazoProjeto.ATENCAO, ProjetoPainelCalculator.calcularAlertaPrazo(projeto));
    }

    @Test
    void calcularAlertaPrazo_projetoFinalizadoComPrevisao_deveIgnorar() {
        LocalDate hoje = LocalDate.now(ZONA);
        Projeto projeto = projeto(ProjetoStatus.FINALIZADO, hoje.minusDays(2));

        assertNull(ProjetoPainelCalculator.calcularAlertaPrazo(projeto));
    }

    @Test
    void calcularAlertaPrazo_execucaoSemPrevisao_deveIgnorar() {
        Projeto projeto = projeto(ProjetoStatus.AGUARDANDO_EXECUCAO, null);

        assertNull(ProjetoPainelCalculator.calcularAlertaPrazo(projeto));
    }

    @Test
    void contaSemPrevisao_apenasExecucaoSemData() {
        assertTrue(ProjetoPainelCalculator.contaSemPrevisao(projeto(ProjetoStatus.AGUARDANDO_EXECUCAO, null)));
        assertFalse(
                ProjetoPainelCalculator.contaSemPrevisao(projeto(ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL, null)));
    }

    private static Projeto projeto(ProjetoStatus status, LocalDate previsao) {
        Projeto p = new Projeto();
        p.setStatus(status);
        p.setPrevisaoConclusaoEm(previsao == null ? null : previsao.atStartOfDay(ZONA).toInstant());
        return p;
    }
}
