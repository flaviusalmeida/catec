package br.com.catec.api.v1.projeto;

import br.com.catec.domain.projeto.ProjetoStatus;
import java.util.Map;

public record ProjetoPainelTotaisResponse(
        long emAndamento,
        long aguardandoRevisaoSocio,
        long aguardandoRespostaCliente,
        long emExecucao,
        Map<ProjetoStatus, Long> porStatus,
        ProjetoPainelAlertasPrazoResponse alertasPrazo) {}
