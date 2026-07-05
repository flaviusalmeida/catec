package br.com.catec.domain.proposta;

/**
 * Estados da proposta comercial (plano §4.2). Fase 1: fluxo até {@link #ENVIADA_AO_CLIENTE};
 * estados de resposta do cliente ficam reservados para registro interno posterior.
 */
public enum PropostaStatus {
    RASCUNHO,
    PENDENTE_AVALIACAO,
    /** Parecer positivo do sócio; aguardando envio ao cliente pelo administrativo. */
    AGUARDANDO_ENVIO,
    ENVIADA_AO_CLIENTE,
    AGUARDANDO_AJUSTE,
    ACEITA,
    NEGADA
}
