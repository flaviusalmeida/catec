package br.com.catec.domain.projeto;

/**
 * Fluxo da proposta comercial (Fase 1). Transições de status alteradas pelo administrativo.
 *
 * <p>Ramo opcional de revisão pelo sócio: após {@link #PROPOSTA_CONCLUIDA} pode ir direto a
 * {@link #PROPOSTA_ENVIADA_CLIENTE} ou passar por {@link #AGUARDANDO_REVISAO} → {@link #EM_REVISAO} →
 * {@link #PROPOSTA_APROVADA_SOCIO} antes do envio.
 */
public enum ProjetoStatus {
    /** Sem cliente vinculado; só é permitido associar cliente. */
    PENDENTE_CLIENTE,
    /** Com cliente; aguardando início da elaboração da proposta comercial. */
    AGUARDANDO_PROPOSTA_COMERCIAL,
    ELABORANDO_PROPOSTA,
    PROPOSTA_CONCLUIDA,
    AGUARDANDO_REVISAO,
    EM_REVISAO,
    PROPOSTA_APROVADA_SOCIO,
    PROPOSTA_ENVIADA_CLIENTE
}
