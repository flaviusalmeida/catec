package br.com.catec.domain.painel;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.domain.proposta.Proposta;
import br.com.catec.domain.proposta.PropostaStatus;
import org.junit.jupiter.api.Test;

class FaseMacroResolverTest {

    private final FaseMacroResolver resolver = new FaseMacroResolver();

    @Test
    void semProposta_usaStatusDoProjeto() {
        Projeto projeto = mock(Projeto.class);
        when(projeto.getStatus()).thenReturn(ProjetoStatus.PENDENTE_CLIENTE);

        assertEquals(FaseMacro.PENDENTE_CLIENTE, resolver.resolver(projeto, null));
    }

    @Test
    void comProposta_priorizaStatusDaProposta() {
        Projeto projeto = mock(Projeto.class);
        when(projeto.getStatus()).thenReturn(ProjetoStatus.ELABORANDO_PROPOSTA);

        Proposta proposta = mock(Proposta.class);
        when(proposta.getStatus()).thenReturn(PropostaStatus.PENDENTE_AVALIACAO_SOCIO);

        assertEquals(FaseMacro.AVALIACAO_SOCIO, resolver.resolver(projeto, proposta));
    }

    @Test
    void propostaEnviadaAoCliente_mapeiaAguardandoResposta() {
        Projeto projeto = mock(Projeto.class);
        Proposta proposta = mock(Proposta.class);
        when(proposta.getStatus()).thenReturn(PropostaStatus.ENVIADA_AO_CLIENTE);

        assertEquals(FaseMacro.AGUARDANDO_RESPOSTA_CLIENTE, resolver.resolver(projeto, proposta));
    }
}
