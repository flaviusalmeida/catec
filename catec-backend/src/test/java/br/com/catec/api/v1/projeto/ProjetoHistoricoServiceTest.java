package br.com.catec.api.v1.projeto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.domain.projeto.historico.ProjetoHistoricoRepository;
import br.com.catec.domain.projeto.historico.ProjetoHistoricoRepository.ProjetoHistoricoLinha;
import br.com.catec.domain.proposta.Proposta;
import br.com.catec.domain.proposta.PropostaRepository;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.security.AuthorizationService;
import br.com.catec.security.UsuarioAutenticado;
import br.com.catec.security.UsuarioAutenticadoFixtures;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ProjetoHistoricoServiceTest {

    @Mock
    private ProjetoRepository projetoRepository;

    @Mock
    private PropostaRepository propostaRepository;

    @Mock
    private ProjetoHistoricoRepository projetoHistoricoRepository;

    private ProjetoHistoricoService projetoHistoricoService;

    @BeforeEach
    void setUp() {
        projetoHistoricoService = new ProjetoHistoricoService(
                projetoRepository,
                propostaRepository,
                projetoHistoricoRepository,
                new AuthorizationService());
    }

    @Test
    void historico_negadoParaColaboradorDeOutroProjeto() {
        Projeto p = projeto(5L);
        Usuario outro = mock(Usuario.class);
        when(outro.getId()).thenReturn(99L);
        when(p.getCriadoPor()).thenReturn(outro);
        when(projetoRepository.findById(5L)).thenReturn(Optional.of(p));

        assertThrows(
                ResponseStatusException.class,
                () -> projetoHistoricoService.historico(colab(9L), 5L, 0, 20));
    }

    @Test
    void historico_retornaPaginaOrdenada() {
        Projeto p = projeto(5L);
        Usuario criador = mock(Usuario.class);
        when(criador.getId()).thenReturn(9L);
        when(p.getCriadoPor()).thenReturn(criador);
        when(projetoRepository.findById(5L)).thenReturn(Optional.of(p));

        Proposta pr = mock(Proposta.class);
        when(pr.getId()).thenReturn(40L);
        when(propostaRepository.findByProjetoIdOrderByVersaoDesc(5L)).thenReturn(List.of(pr));
        when(projetoHistoricoRepository.contarHistoricoProjeto(5L, List.of(40L))).thenReturn(1L);
        when(projetoHistoricoRepository.listarHistoricoProjeto(5L, List.of(40L), 0, 20))
                .thenReturn(List.of(new ProjetoHistoricoLinha(
                        "AUDITORIA",
                        1L,
                        "PROPOSTA",
                        40L,
                        "ENVIAR_CLIENTE",
                        "RASCUNHO",
                        "ENVIADA_AO_CLIENTE",
                        null,
                        null,
                        null,
                        9L,
                        "Admin",
                        Instant.parse("2026-01-01T10:00:00Z"))));

        var page = projetoHistoricoService.historico(colab(9L), 5L, 0, 20);

        assertEquals(1, page.totalElements());
        assertEquals("AUDITORIA", page.content().get(0).origem());
        verify(projetoHistoricoRepository).listarHistoricoProjeto(5L, List.of(40L), 0, 20);
    }

    private static Projeto projeto(long id) {
        Projeto p = mock(Projeto.class);
        when(p.getId()).thenReturn(id);
        when(p.getStatus()).thenReturn(ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL);
        return p;
    }

    private static UsuarioAutenticado colab(long id) {
        return UsuarioAutenticadoFixtures.colaborador(id);
    }
}
