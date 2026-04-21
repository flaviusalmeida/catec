package br.com.catec.domain.projeto;

/**
 * Estados mínimos da Fase 1 (alinhado ao plano §4.1 — subconjunto até proposta).
 */
public enum ProjetoStatus {
    /** Sem cliente vinculado; só é permitido associar cliente. */
    PENDENTE_CLIENTE,
    CRIADO,
    AGUARDANDO_ADM,
    EM_PROPOSTA
}
