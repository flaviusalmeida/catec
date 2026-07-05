package br.com.catec.api.v1.proposta;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.catec.domain.auditoria.AuditoriaService;
import br.com.catec.domain.auditoria.TipoEntidadeAuditoria;
import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.domain.proposta.Proposta;
import br.com.catec.domain.proposta.PropostaRepository;
import br.com.catec.domain.proposta.PropostaStatus;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.security.AuthorizationService;
import br.com.catec.security.UsuarioAutenticado;
import br.com.catec.security.UsuarioAutenticadoFixtures;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class PropostaServiceTest {

    @Mock
    private PropostaRepository propostaRepository;

    @Mock
    private ProjetoRepository projetoRepository;

    @Mock
    private br.com.catec.domain.usuario.UsuarioRepository usuarioRepository;

    @Mock
    private AuditoriaService auditoriaService;

    @Mock
    private br.com.catec.api.v1.documento.DocumentoService documentoService;

    @Mock
    private SocioPropostaNotificacaoService socioPropostaNotificacaoService;

    @Spy
    private AuthorizationService authz = new AuthorizationService();

    @InjectMocks
    private PropostaService service;

    private UsuarioAutenticado admin;
    private UsuarioAutenticado socio;
    private Projeto projeto;

    @BeforeEach
    void setUp() {
        admin = UsuarioAutenticadoFixtures.administrativo(1L);
        socio = UsuarioAutenticadoFixtures.socio(3L);

        projeto = new Projeto();
        org.springframework.test.util.ReflectionTestUtils.setField(projeto, "id", 10L);
        projeto.setStatus(ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL);
        Usuario criador = new Usuario();
        org.springframework.test.util.ReflectionTestUtils.setField(criador, "id", 2L);
        projeto.setCriadoPor(criador);
    }

    @Test
    void criar_deveIniciarEmRascunhoComVersaoEAuditoria() {
        when(projetoRepository.findById(10L)).thenReturn(Optional.of(projeto));
        when(propostaRepository.existsByProjetoIdAndStatusIn(eq(10L), any())).thenReturn(false);
        when(propostaRepository.findMaxVersaoByProjetoId(10L)).thenReturn(0);
        when(usuarioRepository.getReferenceById(1L)).thenReturn(new Usuario());
        when(propostaRepository.save(any(Proposta.class))).thenAnswer(inv -> {
            Proposta p = inv.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(p, "id", 100L);
            return p;
        });
        when(projetoRepository.save(any(Projeto.class))).thenAnswer(inv -> inv.getArgument(0));

        PropostaResponse res = service.criar(10L, admin);

        assertEquals(PropostaStatus.RASCUNHO, res.status());
        assertEquals(1, res.versao());
        verify(auditoriaService)
                .registrarTransicaoStatus(
                        TipoEntidadeAuditoria.PROPOSTA, 100L, "CRIAR", null, "RASCUNHO", 1L);
        verify(auditoriaService)
                .registrarTransicaoStatus(
                        eq(TipoEntidadeAuditoria.PROJETO),
                        eq(10L),
                        eq("SINCRONIZAR_PROPOSTA"),
                        eq("AGUARDANDO_PROPOSTA_COMERCIAL"),
                        eq("ELABORANDO_PROPOSTA"),
                        eq(1L));
    }

    @Test
    void criar_quandoProjetoPropostaConcluidaComAjustePendente_devePermitirNovaVersao() {
        projeto.setStatus(ProjetoStatus.AGUARDANDO_ACEITE_PROPOSTA);
        when(projetoRepository.findById(10L)).thenReturn(Optional.of(projeto));
        when(propostaRepository.existsByProjetoIdAndStatus(10L, PropostaStatus.AGUARDANDO_AJUSTE))
                .thenReturn(true);
        when(propostaRepository.existsByProjetoIdAndStatusIn(eq(10L), any())).thenReturn(false);
        when(propostaRepository.findMaxVersaoByProjetoId(10L)).thenReturn(1);
        when(usuarioRepository.getReferenceById(1L)).thenReturn(new Usuario());
        when(propostaRepository.save(any(Proposta.class))).thenAnswer(inv -> {
            Proposta p = inv.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(p, "id", 101L);
            return p;
        });
        when(projetoRepository.save(any(Projeto.class))).thenAnswer(inv -> inv.getArgument(0));

        PropostaResponse res = service.criar(10L, admin);
        assertEquals(PropostaStatus.RASCUNHO, res.status());
        verify(auditoriaService)
                .registrarTransicaoStatus(
                        eq(TipoEntidadeAuditoria.PROJETO),
                        eq(10L),
                        eq("SINCRONIZAR_PROPOSTA"),
                        eq("AGUARDANDO_ACEITE_PROPOSTA"),
                        eq("ELABORANDO_PROPOSTA"),
                        eq(1L));
    }

    @Test
    void criar_quandoProjetoPropostaConcluidaSemAjuste_deveRetornar400() {
        projeto.setStatus(ProjetoStatus.AGUARDANDO_ACEITE_PROPOSTA);
        when(projetoRepository.findById(10L)).thenReturn(Optional.of(projeto));
        when(propostaRepository.existsByProjetoIdAndStatus(10L, PropostaStatus.AGUARDANDO_AJUSTE))
                .thenReturn(false);
        when(propostaRepository.existsByProjetoIdAndConsideracoesPendentesTrue(10L)).thenReturn(false);

        ResponseStatusException ex =
                assertThrows(ResponseStatusException.class, () -> service.criar(10L, admin));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(propostaRepository, never()).save(any());
    }

    @Test
    void enviarAoCliente_semParecerSocio_deveRetornar400() {
        Proposta proposta = proposta(50L, PropostaStatus.RASCUNHO);
        when(propostaRepository.findById(50L)).thenReturn(Optional.of(proposta));

        ResponseStatusException ex =
                assertThrows(ResponseStatusException.class, () -> service.enviarAoCliente(10L, 50L, admin));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(propostaRepository, never()).save(any());
    }

    @Test
    void enviarAoCliente_transicaoIlegal_deveRetornar400() {
        Proposta proposta = proposta(51L, PropostaStatus.ENVIADA_AO_CLIENTE);
        when(propostaRepository.findById(51L)).thenReturn(Optional.of(proposta));

        ResponseStatusException ex =
                assertThrows(ResponseStatusException.class, () -> service.enviarAoCliente(10L, 51L, admin));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(propostaRepository, never()).save(any());
    }

    @Test
    void obter_quandoPropostaDeOutroProjeto_deveRetornar404() {
        Proposta proposta = proposta(70L, PropostaStatus.RASCUNHO);
        when(propostaRepository.findById(70L)).thenReturn(Optional.of(proposta));

        ResponseStatusException ex =
                assertThrows(ResponseStatusException.class, () -> service.obter(99L, 70L, admin));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void uploadDocumentoNoFluxo_semProposta_deveCriarRascunhoEAnexar() {
        Projeto projeto = new Projeto();
        org.springframework.test.util.ReflectionTestUtils.setField(projeto, "id", 10L);
        projeto.setStatus(ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL);
        Usuario criador = new Usuario();
        org.springframework.test.util.ReflectionTestUtils.setField(criador, "id", 2L);
        projeto.setCriadoPor(criador);

        when(projetoRepository.findById(10L)).thenReturn(Optional.of(projeto));
        when(propostaRepository.findFirstByProjetoIdAndStatusInOrderByVersaoDesc(eq(10L), any()))
                .thenReturn(Optional.empty());
        when(propostaRepository.existsByProjetoIdAndStatusIn(eq(10L), any())).thenReturn(false);
        when(propostaRepository.findMaxVersaoByProjetoId(10L)).thenReturn(0);
        when(usuarioRepository.getReferenceById(1L)).thenReturn(new Usuario());
        when(propostaRepository.save(any(Proposta.class))).thenAnswer(inv -> {
            Proposta p = inv.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(p, "id", 200L);
            return p;
        });
        when(projetoRepository.save(any(Projeto.class))).thenAnswer(inv -> inv.getArgument(0));
        when(propostaRepository.findById(200L)).thenAnswer(inv -> {
            Proposta p = proposta(200L, PropostaStatus.RASCUNHO);
            return Optional.of(p);
        });
        when(documentoService.uploadPropostaSubstituindo(eq(200L), eq("PROPOSTA_PDF"), any(), eq(admin)))
                .thenReturn(new br.com.catec.api.v1.documento.DocumentoResponse(
                        1L,
                        br.com.catec.domain.documento.TipoVinculoDocumento.PROPOSTA,
                        200L,
                        "PROPOSTA_PDF",
                        "p.pdf",
                        "application/pdf",
                        10L,
                        1,
                        1L,
                        "Admin",
                        null));

        service.uploadDocumentoNoFluxo(10L, "PROPOSTA_PDF", null, admin);

        verify(documentoService).uploadPropostaSubstituindo(eq(200L), eq("PROPOSTA_PDF"), any(), eq(admin));
    }

    @Test
    void uploadDocumento_quandoEnviadaAoCliente_deveRetornar400() {
        Proposta proposta = proposta(71L, PropostaStatus.ENVIADA_AO_CLIENTE);
        when(propostaRepository.findById(71L)).thenReturn(Optional.of(proposta));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> service.uploadDocumento(10L, 71L, null, null, admin));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void aprovarPeloSocio_quandoNaoPendente_deveRetornar400() {
        Proposta proposta = proposta(52L, PropostaStatus.RASCUNHO);
        when(propostaRepository.findById(52L)).thenReturn(Optional.of(proposta));

        ResponseStatusException ex =
                assertThrows(ResponseStatusException.class, () -> service.aprovarPeloSocio(10L, 52L, socio));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void devolverParaRascunho_semObservacao_deveRetornar400() {
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class, () -> service.devolverParaRascunho(10L, 53L, "  ", socio));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void enviarAoCliente_quandoPendenteSocio_deveRetornar400() {
        Proposta proposta = proposta(54L, PropostaStatus.PENDENTE_AVALIACAO);
        when(propostaRepository.findById(54L)).thenReturn(Optional.of(proposta));

        ResponseStatusException ex =
                assertThrows(ResponseStatusException.class, () -> service.enviarAoCliente(10L, 54L, admin));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void listarPorProjeto_quandoPropostaPendenteAvaliacao_deveReconciliarProjetoAguardandoRevisao() {
        projeto.setStatus(ProjetoStatus.ELABORANDO_PROPOSTA);
        Proposta proposta = proposta(70L, PropostaStatus.PENDENTE_AVALIACAO);
        when(projetoRepository.findById(10L)).thenReturn(Optional.of(projeto));
        when(propostaRepository.findByProjetoIdOrderByVersaoDesc(10L)).thenReturn(List.of(proposta));
        when(projetoRepository.save(any(Projeto.class))).thenAnswer(inv -> inv.getArgument(0));

        service.listarPorProjeto(10L, admin);

        assertEquals(ProjetoStatus.AGUARDANDO_REVISAO_PROPOSTA, projeto.getStatus());
        verify(auditoriaService)
                .registrarTransicaoStatus(
                        eq(TipoEntidadeAuditoria.PROJETO),
                        eq(10L),
                        eq("SINCRONIZAR_PROPOSTA"),
                        eq("ELABORANDO_PROPOSTA"),
                        eq("AGUARDANDO_REVISAO_PROPOSTA"),
                        eq(1L));
    }

    @Test
    void submeterParaAvaliacaoSocio_deveSincronizarProjetoAguardandoRevisao() {
        Proposta proposta = proposta(61L, PropostaStatus.RASCUNHO);
        when(propostaRepository.findById(61L)).thenReturn(Optional.of(proposta));
        when(propostaRepository.save(any(Proposta.class))).thenAnswer(inv -> inv.getArgument(0));
        when(projetoRepository.save(any(Projeto.class))).thenAnswer(inv -> inv.getArgument(0));

        PropostaResponse res = service.submeterParaAvaliacaoSocio(10L, 61L, admin);

        assertEquals(PropostaStatus.PENDENTE_AVALIACAO, res.status());
        assertEquals(ProjetoStatus.AGUARDANDO_REVISAO_PROPOSTA, projeto.getStatus());
        verify(auditoriaService)
                .registrarTransicaoStatus(
                        eq(TipoEntidadeAuditoria.PROJETO),
                        eq(10L),
                        eq("SINCRONIZAR_PROPOSTA"),
                        eq("ELABORANDO_PROPOSTA"),
                        eq("AGUARDANDO_REVISAO_PROPOSTA"),
                        eq(1L));
    }

    @Test
    void listarPorProjeto_quandoPropostaAprovada_deveReconciliarProjetoAguardandoEnvio() {
        projeto.setStatus(ProjetoStatus.ELABORANDO_PROPOSTA);
        Proposta proposta = proposta(71L, PropostaStatus.AGUARDANDO_ENVIO);
        proposta.setAvaliadaSocioEm(java.time.Instant.now());
        when(projetoRepository.findById(10L)).thenReturn(Optional.of(projeto));
        when(propostaRepository.findByProjetoIdOrderByVersaoDesc(10L)).thenReturn(List.of(proposta));
        when(projetoRepository.save(any(Projeto.class))).thenAnswer(inv -> inv.getArgument(0));

        service.listarPorProjeto(10L, admin);

        assertEquals(ProjetoStatus.AGUARDANDO_ENVIO_CLIENTE, projeto.getStatus());
        verify(auditoriaService)
                .registrarTransicaoStatus(
                        eq(TipoEntidadeAuditoria.PROJETO),
                        eq(10L),
                        eq("SINCRONIZAR_PROPOSTA"),
                        eq("ELABORANDO_PROPOSTA"),
                        eq("AGUARDANDO_ENVIO_CLIENTE"),
                        eq(1L));
    }

    @Test
    void fluxoComSocio_submeterAprovarEnviar() {
        Proposta proposta = proposta(60L, PropostaStatus.RASCUNHO);
        when(propostaRepository.findById(60L)).thenReturn(Optional.of(proposta));
        when(propostaRepository.save(any(Proposta.class))).thenAnswer(inv -> inv.getArgument(0));
        when(usuarioRepository.getReferenceById(3L)).thenReturn(new Usuario());

        PropostaResponse r1 = service.submeterParaAvaliacaoSocio(10L, 60L, admin);
        assertEquals(PropostaStatus.PENDENTE_AVALIACAO, r1.status());

        proposta.setStatus(PropostaStatus.PENDENTE_AVALIACAO);
        PropostaResponse r2 = service.aprovarPeloSocio(10L, 60L, socio);
        assertEquals(PropostaStatus.AGUARDANDO_ENVIO, r2.status());
        assertEquals(ProjetoStatus.AGUARDANDO_ENVIO_CLIENTE, projeto.getStatus());

        proposta.setStatus(PropostaStatus.AGUARDANDO_ENVIO);
        proposta.setAvaliadaSocioEm(java.time.Instant.now());
        projeto.setStatus(ProjetoStatus.AGUARDANDO_ENVIO_CLIENTE);
        when(projetoRepository.save(any(Projeto.class))).thenAnswer(inv -> inv.getArgument(0));
        PropostaResponse r3 = service.enviarAoCliente(10L, 60L, admin);
        assertEquals(PropostaStatus.ENVIADA_AO_CLIENTE, r3.status());

        verify(auditoriaService, org.mockito.Mockito.times(3))
                .registrar(
                        eq(TipoEntidadeAuditoria.PROPOSTA),
                        eq(60L),
                        any(),
                        any(),
                        any(),
                        any(),
                        any());
    }

    private static Proposta proposta(long id, PropostaStatus status) {
        Proposta p = new Proposta();
        org.springframework.test.util.ReflectionTestUtils.setField(p, "id", id);
        Projeto proj = new Projeto();
        org.springframework.test.util.ReflectionTestUtils.setField(proj, "id", 10L);
        proj.setStatus(ProjetoStatus.ELABORANDO_PROPOSTA);
        Usuario criador = new Usuario();
        org.springframework.test.util.ReflectionTestUtils.setField(criador, "id", 2L);
        criador.setNome("Colab");
        proj.setCriadoPor(criador);
        p.setProjeto(proj);
        p.setStatus(status);
        p.setVersao(1);
        Usuario elab = new Usuario();
        org.springframework.test.util.ReflectionTestUtils.setField(elab, "id", 1L);
        elab.setNome("Admin");
        p.setElaboradoPor(elab);
        return p;
    }
}
