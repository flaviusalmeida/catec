package br.com.catec.domain.painel;

/**
 * Fase macro exibida no painel (§3.9 / Fase 1). Derivada de {@code projeto.status} e, quando existe,
 * da proposta de maior {@code versao} do projeto.
 *
 * <p><strong>Prioridade (da mais específica à mais geral):</strong>
 * <ol>
 *   <li>Se há proposta vigente (maior versão), o status da proposta define a fase (tabela abaixo).</li>
 *   <li>Sem proposta, usa-se apenas {@code projeto.status}.</li>
 * </ol>
 *
 * <p>Mapeamento proposta → fase: {@code NEGADA→ENCERRADA_NEGADA}, {@code ACEITA→ENCERRADA_ACEITA},
 * {@code AGUARDANDO_AJUSTE_ADM→AGUARDANDO_AJUSTE_INTERNO}, {@code EM_AVALIACAO_CLIENTE→AVALIACAO_CLIENTE},
 * {@code ENVIADA_AO_CLIENTE→AGUARDANDO_RESPOSTA_CLIENTE}, {@code APROVADA_INTERNA→APROVADA_AGUARDANDO_ENVIO},
 * {@code PENDENTE_AVALIACAO_SOCIO→AVALIACAO_SOCIO}, {@code RASCUNHO→ELABORACAO_PROPOSTA}.
 *
 * <p>Mapeamento projeto (sem proposta): {@code PENDENTE_CLIENTE→PENDENTE_CLIENTE},
 * {@code AGUARDANDO_PROPOSTA_COMERCIAL→AGUARDANDO_INICIO_PROPOSTA},
 * {@code ELABORANDO_PROPOSTA→ELABORACAO_PROPOSTA}, {@code PROPOSTA_CONCLUIDA→PROPOSTA_CONCLUIDA}.
 */
public enum FaseMacro {
    PENDENTE_CLIENTE,
    AGUARDANDO_INICIO_PROPOSTA,
    ELABORACAO_PROPOSTA,
    AVALIACAO_SOCIO,
    APROVADA_AGUARDANDO_ENVIO,
    AGUARDANDO_RESPOSTA_CLIENTE,
    AVALIACAO_CLIENTE,
    AGUARDANDO_AJUSTE_INTERNO,
    ENCERRADA_ACEITA,
    ENCERRADA_NEGADA,
    PROPOSTA_CONCLUIDA
}
