package br.com.catec.api.v1.projeto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.catec.domain.auditoria.AuditoriaFluxoRepository;
import br.com.catec.domain.auditoria.TipoEntidadeAuditoria;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.security.AuthorizationService;
import br.com.catec.security.UsuarioAutenticadoFixtures;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProjetoResumoServiceTest {

    @Mock
    private ProjetoRepository projetoRepository;

    @Mock
    private AuditoriaFluxoRepository auditoriaFluxoRepository;

    @Mock
    private AuthorizationService authz;

    @InjectMocks
    private ProjetoResumoService service;

    @Test
    void resumo_quandoAdmin_deveUsarContagensGlobais() {
        when(authz.podeListarTodosProjetos(any())).thenReturn(true);
        when(projetoRepository.countByStatus(ProjetoStatus.ELABORANDO_PROPOSTA)).thenReturn(4L);
        when(projetoRepository.countByStatus(ProjetoStatus.AGUARDANDO_ACEITE_PROPOSTA)).thenReturn(0L);
        when(projetoRepository.countByStatus(ProjetoStatus.AGUARDANDO_EXECUCAO)).thenReturn(2L);
        when(projetoRepository.countByStatus(ProjetoStatus.EM_EXECUCAO)).thenReturn(0L);

        when(auditoriaFluxoRepository.countDistinctEntradasPorStatus(
                        eq(TipoEntidadeAuditoria.PROJETO), eq("ELABORANDO_PROPOSTA"), any(Instant.class), any(Instant.class)))
                .thenReturn(2L);
        when(auditoriaFluxoRepository.countDistinctSaidasPorStatus(
                        eq(TipoEntidadeAuditoria.PROJETO), eq("ELABORANDO_PROPOSTA"), any(Instant.class), any(Instant.class)))
                .thenReturn(1L);
        when(auditoriaFluxoRepository.countDistinctEntradasPorStatus(
                        eq(TipoEntidadeAuditoria.PROJETO), eq("AGUARDANDO_ACEITE_PROPOSTA"), any(Instant.class), any(Instant.class)))
                .thenReturn(0L);
        when(auditoriaFluxoRepository.countDistinctSaidasPorStatus(
                        eq(TipoEntidadeAuditoria.PROJETO), eq("AGUARDANDO_ACEITE_PROPOSTA"), any(Instant.class), any(Instant.class)))
                .thenReturn(0L);
        when(auditoriaFluxoRepository.countDistinctEntradasPorStatus(
                        eq(TipoEntidadeAuditoria.PROJETO), eq("AGUARDANDO_EXECUCAO"), any(Instant.class), any(Instant.class)))
                .thenReturn(0L);
        when(auditoriaFluxoRepository.countDistinctSaidasPorStatus(
                        eq(TipoEntidadeAuditoria.PROJETO), eq("AGUARDANDO_EXECUCAO"), any(Instant.class), any(Instant.class)))
                .thenReturn(0L);
        when(auditoriaFluxoRepository.countDistinctEntradasPorStatus(
                        eq(TipoEntidadeAuditoria.PROJETO), eq("EM_EXECUCAO"), any(Instant.class), any(Instant.class)))
                .thenReturn(0L);
        when(auditoriaFluxoRepository.countDistinctSaidasPorStatus(
                        eq(TipoEntidadeAuditoria.PROJETO), eq("EM_EXECUCAO"), any(Instant.class), any(Instant.class)))
                .thenReturn(0L);

        ProjetoResumoResponse out = service.resumo(UsuarioAutenticadoFixtures.administrativo(1L));

        assertEquals(30, out.periodoDias());
        assertEquals(4, out.cards().size());
        ProjetoResumoCardResponse revisao = out.cards().get(0);
        assertEquals(ProjetoStatus.ELABORANDO_PROPOSTA, revisao.status());
        assertEquals(4, revisao.total());
        assertEquals(3, revisao.totalHa30Dias());
        assertEquals(33.333333333333336, revisao.variacaoPercentual());

        verify(projetoRepository).countByStatus(ProjetoStatus.ELABORANDO_PROPOSTA);
        verify(projetoRepository, org.mockito.Mockito.never()).countByStatusAndCriadoPorId(any(), any());
    }

    @Test
    void resumo_quandoColaborador_deveFiltrarPorCriador() {
        when(authz.podeListarTodosProjetos(any())).thenReturn(false);
        when(projetoRepository.countByStatusAndCriadoPorId(any(), eq(2L))).thenReturn(1L);
        when(auditoriaFluxoRepository.countDistinctEntradasPorStatusAndCriadoPorId(
                        eq(TipoEntidadeAuditoria.PROJETO), any(), any(Instant.class), any(Instant.class), eq(2L)))
                .thenReturn(0L);
        when(auditoriaFluxoRepository.countDistinctSaidasPorStatusAndCriadoPorId(
                        eq(TipoEntidadeAuditoria.PROJETO), any(), any(Instant.class), any(Instant.class), eq(2L)))
                .thenReturn(0L);

        service.resumo(UsuarioAutenticadoFixtures.colaborador(2L));

        verify(projetoRepository).countByStatusAndCriadoPorId(ProjetoStatus.ELABORANDO_PROPOSTA, 2L);
        verify(auditoriaFluxoRepository)
                .countDistinctEntradasPorStatusAndCriadoPorId(
                        eq(TipoEntidadeAuditoria.PROJETO),
                        eq("ELABORANDO_PROPOSTA"),
                        any(Instant.class),
                        any(Instant.class),
                        eq(2L));
    }
}
