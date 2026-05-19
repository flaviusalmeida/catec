package br.com.catec.api.v1.painel;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.catec.domain.cliente.Cliente;
import br.com.catec.domain.painel.FaseMacro;
import br.com.catec.domain.painel.FaseMacroResolver;
import br.com.catec.domain.painel.PainelHistoricoRepository;
import br.com.catec.domain.painel.PainelHistoricoRepository.PainelHistoricoLinha;
import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.domain.proposta.Proposta;
import br.com.catec.domain.proposta.PropostaRepository;
import br.com.catec.domain.proposta.PropostaStatus;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.security.UsuarioAutenticado;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class PainelServiceTest {

    @Mock
    private ProjetoRepository projetoRepository;

    @Mock
    private PropostaRepository propostaRepository;

    @Mock
    private PainelHistoricoRepository painelHistoricoRepository;

    private PainelService painelService;

    @BeforeEach
    void setUp() {
        painelService = new PainelService(
                projetoRepository, propostaRepository, new FaseMacroResolver(), painelHistoricoRepository);
    }

    @Test
    void resumo_filtraPorFaseMacro() {
        Projeto p1 = projeto(1L, "A", ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL);
        Projeto p2 = projeto(2L, "B", ProjetoStatus.PENDENTE_CLIENTE);
        when(projetoRepository.findAll(any(Specification.class), any(Sort.class))).thenReturn(List.of(p1, p2));
        when(propostaRepository.findMaisRecentesPorProjetoIds(List.of(1L, 2L))).thenReturn(List.of());

        var page = painelService.resumo(admin(), null, FaseMacro.PENDENTE_CLIENTE, null, 0, 20);

        assertEquals(1, page.totalElements());
        assertEquals(FaseMacro.PENDENTE_CLIENTE, page.content().get(0).faseMacro());
    }

    @Test
    void indicadores_respeitaEscopoColaborador() {
        when(projetoRepository.countByStatusAndCriadoPorId(ProjetoStatus.PENDENTE_CLIENTE, 9L))
                .thenReturn(2L);
        when(propostaRepository.countByStatusInAndProjetoCriadoPor(any(), eq(9L)))
                .thenReturn(0L, 1L, 3L);
        when(propostaRepository.countAguardandoSocio(PropostaStatus.PENDENTE_AVALIACAO_SOCIO, 9L))
                .thenReturn(1L);

        var ind = painelService.indicadores(colab(9L));

        assertEquals(2, ind.projetosPendentesCliente());
        assertEquals(1, ind.propostasAguardandoAvaliacaoSocio());
        assertEquals(3, ind.propostasEmRascunho());
    }

    @Test
    void historico_negadoParaColaboradorDeOutroProjeto() {
        Projeto p = projeto(5L, "X", ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL);
        Usuario outro = mock(Usuario.class);
        when(outro.getId()).thenReturn(99L);
        when(p.getCriadoPor()).thenReturn(outro);
        when(projetoRepository.findById(5L)).thenReturn(Optional.of(p));

        assertThrows(
                ResponseStatusException.class,
                () -> painelService.historico(colab(9L), 5L, 0, 20));
    }

    @Test
    void historico_retornaPaginaOrdenada() {
        Projeto p = projeto(5L, "X", ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL);
        Usuario criador = mock(Usuario.class);
        when(criador.getId()).thenReturn(9L);
        when(p.getCriadoPor()).thenReturn(criador);
        when(projetoRepository.findById(5L)).thenReturn(Optional.of(p));

        Proposta pr = mock(Proposta.class);
        when(pr.getId()).thenReturn(40L);
        when(propostaRepository.findByProjetoIdOrderByVersaoDesc(5L)).thenReturn(List.of(pr));
        when(painelHistoricoRepository.contarHistoricoProjeto(5L, List.of(40L))).thenReturn(1L);
        when(painelHistoricoRepository.listarHistoricoProjeto(5L, List.of(40L), 0, 20))
                .thenReturn(List.of(new PainelHistoricoLinha(
                        "AUDITORIA",
                        1L,
                        "PROPOSTA",
                        40L,
                        "ENVIAR_CLIENTE",
                        "APROVADA_INTERNA",
                        "ENVIADA_AO_CLIENTE",
                        null,
                        null,
                        null,
                        9L,
                        "Admin",
                        Instant.parse("2026-01-01T10:00:00Z"))));

        var page = painelService.historico(colab(9L), 5L, 0, 20);

        assertEquals(1, page.totalElements());
        assertEquals("AUDITORIA", page.content().get(0).origem());
        verify(painelHistoricoRepository).listarHistoricoProjeto(5L, List.of(40L), 0, 20);
    }

    private static Projeto projeto(long id, String titulo, ProjetoStatus status) {
        Projeto p = mock(Projeto.class);
        Cliente c = mock(Cliente.class);
        Usuario criador = mock(Usuario.class);
        when(p.getId()).thenReturn(id);
        when(p.getTitulo()).thenReturn(titulo);
        when(p.getStatus()).thenReturn(status);
        when(p.getCliente()).thenReturn(c);
        when(c.getId()).thenReturn(10L);
        when(c.getRazaoSocialOuNome()).thenReturn("Cliente");
        when(p.getCriadoPor()).thenReturn(criador);
        when(criador.getId()).thenReturn(9L);
        when(p.getAtualizadoEm()).thenReturn(Instant.parse("2026-05-01T12:00:00Z"));
        return p;
    }

    private static UsuarioAutenticado admin() {
        return new UsuarioAutenticado(1L, "admin@catec.local", "Admin", false, List.of(new SimpleGrantedAuthority("ROLE_ADMINISTRATIVO")));
    }

    private static UsuarioAutenticado colab(long id) {
        return new UsuarioAutenticado(id, "c@test.local", "Colab", false, List.of(new SimpleGrantedAuthority("ROLE_COLABORADOR")));
    }
}
