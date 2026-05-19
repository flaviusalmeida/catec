package br.com.catec.domain.proposta;

/**
 * Estados da proposta comercial (plano §4.2). Fase 1: fluxo até {@link #ENVIADA_AO_CLIENTE};
 * estados de resposta do cliente ficam reservados para registro interno posterior.
 */
public enum PropostaStatus {
    RASCUNHO,
    PENDENTE_AVALIACAO_SOCIO,
    APROVADA_INTERNA,
    ENVIADA_AO_CLIENTE,
    EM_AVALIACAO_CLIENTE,
    AGUARDANDO_AJUSTE_ADM,
    ACEITA,
    NEGADA
}
