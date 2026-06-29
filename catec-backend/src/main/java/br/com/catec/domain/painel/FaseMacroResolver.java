package br.com.catec.domain.painel;

import br.com.catec.domain.contrato.Contrato;
import br.com.catec.domain.contrato.ContratoStatus;
import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.domain.proposta.Proposta;
import org.springframework.stereotype.Component;

@Component
public class FaseMacroResolver {

    public FaseMacro resolver(Projeto projeto, Proposta propostaMaisRecente) {
        return resolver(projeto, propostaMaisRecente, null);
    }

    public FaseMacro resolver(Projeto projeto, Proposta propostaMaisRecente, Contrato contrato) {
        if (contrato != null) {
            return fromContrato(contrato.getStatus());
        }
        if (propostaMaisRecente != null) {
            return fromProposta(propostaMaisRecente);
        }
        return fromProjeto(projeto.getStatus());
    }

    private static FaseMacro fromContrato(ContratoStatus status) {
        return switch (status) {
            case RECUSADO -> FaseMacro.ENCERRADA_NEGADA;
            case ACEITO -> FaseMacro.AGUARDANDO_EXECUCAO;
            case AGUARDANDO_AJUSTE -> FaseMacro.AGUARDANDO_AJUSTE_INTERNO;
            case ENVIADO_AO_CLIENTE -> FaseMacro.AGUARDANDO_RESPOSTA_CLIENTE;
            case RASCUNHO -> FaseMacro.AGUARDANDO_CONTRATO;
        };
    }

    private static FaseMacro fromProposta(Proposta proposta) {
        return switch (proposta.getStatus()) {
            case NEGADA -> FaseMacro.ENCERRADA_NEGADA;
            case ACEITA -> FaseMacro.AGUARDANDO_CONTRATO;
            case AGUARDANDO_AJUSTE -> FaseMacro.AGUARDANDO_AJUSTE_INTERNO;
            case EM_AVALIACAO_CLIENTE -> FaseMacro.AVALIACAO_CLIENTE;
            case ENVIADA_AO_CLIENTE -> FaseMacro.AGUARDANDO_RESPOSTA_CLIENTE;
            case PENDENTE_AVALIACAO -> FaseMacro.AVALIACAO_SOCIO;
            case RASCUNHO -> proposta.getAvaliadaSocioEm() != null
                    ? FaseMacro.APROVADA_AGUARDANDO_ENVIO
                    : FaseMacro.ELABORACAO_PROPOSTA;
        };
    }

    private static FaseMacro fromProjeto(ProjetoStatus status) {
        return switch (status) {
            case PENDENTE_CLIENTE -> FaseMacro.PENDENTE_CLIENTE;
            case AGUARDANDO_PROPOSTA_COMERCIAL -> FaseMacro.AGUARDANDO_INICIO_PROPOSTA;
            case ELABORANDO_PROPOSTA -> FaseMacro.ELABORACAO_PROPOSTA;
            case AGUARDANDO_ACEITE_PROPOSTA -> FaseMacro.AGUARDANDO_RESPOSTA_CLIENTE;
            case AGUARDANDO_CONTRATO -> FaseMacro.AGUARDANDO_CONTRATO;
            case AGUARDANDO_EXECUCAO -> FaseMacro.AGUARDANDO_EXECUCAO;
            case EM_EXECUCAO -> FaseMacro.EM_EXECUCAO;
            case CANCELADO -> FaseMacro.ENCERRADA_NEGADA;
        };
    }
}
