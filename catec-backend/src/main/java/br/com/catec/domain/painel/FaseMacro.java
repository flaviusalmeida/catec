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
 * <p>Mapeamento proposta → fase: {@code NEGADA→ENCERRADA_NEGADA}, {@code ACEITA→AGUARDANDO_CONTRATO},
 * {@code AGUARDANDO_AJUSTE→AGUARDANDO_AJUSTE_INTERNO}, {@code EM_AVALIACAO_CLIENTE→AVALIACAO_CLIENTE},
 * {@code ENVIADA_AO_CLIENTE→AGUARDANDO_RESPOSTA_CLIENTE}, {@code RASCUNHO+parecer sócio→APROVADA_AGUARDANDO_ENVIO},
 * {@code PENDENTE_AVALIACAO→AVALIACAO_SOCIO}, {@code RASCUNHO→ELABORACAO_PROPOSTA}.
 *
 * <p>Mapeamento projeto (sem proposta): {@code PENDENTE_CLIENTE→PENDENTE_CLIENTE},
 * {@code AGUARDANDO_PROPOSTA_COMERCIAL→AGUARDANDO_INICIO_PROPOSTA},
 * {@code ELABORANDO_PROPOSTA→ELABORACAO_PROPOSTA}, {@code AGUARDANDO_ACEITE_PROPOSTA→AGUARDANDO_RESPOSTA_CLIENTE},
 * {@code AGUARDANDO_CONTRATO→AGUARDANDO_CONTRATO}, {@code CANCELADO→ENCERRADA_NEGADA}.
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
    AGUARDANDO_CONTRATO,
    AGUARDANDO_EXECUCAO,
    EM_EXECUCAO,
    ENCERRADA_ACEITA,
    ENCERRADA_NEGADA,
    PROPOSTA_CONCLUIDA
}
