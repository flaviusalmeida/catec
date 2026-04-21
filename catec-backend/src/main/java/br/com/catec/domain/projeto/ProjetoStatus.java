package br.com.catec.domain.projeto;

/**
 * Estados do projeto (demanda inicial). Revisão, aprovação sócio e envio ao cliente ficam no CRUD de
 * proposta (futuro).
 */
public enum ProjetoStatus {
    /** Sem cliente vinculado; só é permitido associar cliente. */
    PENDENTE_CLIENTE,
    /** Com cliente; aguardando início da elaboração da proposta comercial. */
    AGUARDANDO_PROPOSTA_COMERCIAL,
    ELABORANDO_PROPOSTA,
    /** Proposta comercial pronta no âmbito do projeto; etapas seguintes na entidade Proposta (futuro). */
    PROPOSTA_CONCLUIDA
}
