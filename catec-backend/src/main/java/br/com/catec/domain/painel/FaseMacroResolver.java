package br.com.catec.domain.painel;

import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.domain.proposta.Proposta;
import br.com.catec.domain.proposta.PropostaStatus;
import org.springframework.stereotype.Component;

@Component
public class FaseMacroResolver {

    public FaseMacro resolver(Projeto projeto, Proposta propostaMaisRecente) {
        if (propostaMaisRecente != null) {
            return fromProposta(propostaMaisRecente.getStatus());
        }
        return fromProjeto(projeto.getStatus());
    }

    private static FaseMacro fromProposta(PropostaStatus status) {
        return switch (status) {
            case NEGADA -> FaseMacro.ENCERRADA_NEGADA;
            case ACEITA -> FaseMacro.ENCERRADA_ACEITA;
            case AGUARDANDO_AJUSTE_ADM -> FaseMacro.AGUARDANDO_AJUSTE_INTERNO;
            case EM_AVALIACAO_CLIENTE -> FaseMacro.AVALIACAO_CLIENTE;
            case ENVIADA_AO_CLIENTE -> FaseMacro.AGUARDANDO_RESPOSTA_CLIENTE;
            case APROVADA_INTERNA -> FaseMacro.APROVADA_AGUARDANDO_ENVIO;
            case PENDENTE_AVALIACAO_SOCIO -> FaseMacro.AVALIACAO_SOCIO;
            case RASCUNHO -> FaseMacro.ELABORACAO_PROPOSTA;
        };
    }

    private static FaseMacro fromProjeto(ProjetoStatus status) {
        return switch (status) {
            case PENDENTE_CLIENTE -> FaseMacro.PENDENTE_CLIENTE;
            case AGUARDANDO_PROPOSTA_COMERCIAL -> FaseMacro.AGUARDANDO_INICIO_PROPOSTA;
            case ELABORANDO_PROPOSTA -> FaseMacro.ELABORACAO_PROPOSTA;
            case PROPOSTA_CONCLUIDA -> FaseMacro.PROPOSTA_CONCLUIDA;
        };
    }
}
