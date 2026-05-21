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
    /** Proposta comercial enviada ao cliente; aguardando aceite, recusa ou considerações. */
    AGUARDANDO_ACEITE_PROPOSTA,
    /** Proposta comercial aceita pelo cliente; aguardando formalização do contrato. */
    AGUARDANDO_CONTRATO,
    /** Contrato aceito pelo cliente; demanda em execução. */
    EM_EXECUCAO,
    /** Proposta ou contrato recusado pelo cliente; demanda encerrada. */
    CANCELADO
}
