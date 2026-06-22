package br.com.catec.api.v1.interacao;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.catec.domain.auditoria.AuditoriaService;
import br.com.catec.domain.auditoria.TipoEntidadeAuditoria;
import br.com.catec.domain.documento.DocumentoRepository;
import br.com.catec.domain.interacao.InteracaoFluxo;
import br.com.catec.domain.interacao.InteracaoFluxoRepository;
import br.com.catec.domain.interacao.TipoInteracaoFluxo;
import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.domain.proposta.Proposta;
import br.com.catec.domain.proposta.PropostaRepository;
import br.com.catec.domain.proposta.PropostaStatus;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.security.AuthorizationService;
import br.com.catec.security.UsuarioAutenticado;
import br.com.catec.security.UsuarioAutenticadoFixtures;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class InteracaoFluxoServiceTest {

    @Mock
    private InteracaoFluxoRepository interacaoFluxoRepository;

    @Mock
    private PropostaRepository propostaRepository;

    @Mock
    private br.com.catec.domain.contrato.ContratoRepository contratoRepository;

    @Mock
    private ProjetoRepository projetoRepository;

    @Mock
    private DocumentoRepository documentoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AuditoriaService auditoriaService;

    @Spy
    private AuthorizationService authz = new AuthorizationService();

    @InjectMocks
    private InteracaoFluxoService service;

    @Test
    void registrarAceite_deveAtualizarPropostaParaAceitaEProjetoAguardandoContrato() {
        Proposta proposta = proposta(5L, PropostaStatus.ENVIADA_AO_CLIENTE, ProjetoStatus.AGUARDANDO_ACEITE_PROPOSTA);
        when(propostaRepository.findById(5L)).thenReturn(Optional.of(proposta));
        when(usuarioRepository.getReferenceById(1L)).thenReturn(new Usuario());
        when(propostaRepository.save(any(Proposta.class))).thenAnswer(inv -> inv.getArgument(0));
        when(projetoRepository.save(any(Projeto.class))).thenAnswer(inv -> inv.getArgument(0));
        when(interacaoFluxoRepository.save(any(InteracaoFluxo.class))).thenAnswer(inv -> {
            InteracaoFluxo i = inv.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(i, "id", 99L);
            Usuario u = new Usuario();
            org.springframework.test.util.ReflectionTestUtils.setField(u, "id", 1L);
            u.setNome("Admin");
            i.setRegistradoPor(u);
            return i;
        });

        var req = new InteracaoFluxoCreateRequest(TipoInteracaoFluxo.ACEITE_CLIENTE, "Cliente aceitou por e-mail.", null);
        var res = service.registrarRespostaCliente(10L, 5L, req, admin());

        assertEquals(PropostaStatus.ACEITA, res.proposta().status());
        assertEquals(ProjetoStatus.AGUARDANDO_CONTRATO, proposta.getProjeto().getStatus());
        assertEquals(TipoInteracaoFluxo.ACEITE_CLIENTE, res.interacao().tipoInteracao());
        verify(auditoriaService)
                .registrarTransicaoStatus(
                        eq(TipoEntidadeAuditoria.PROPOSTA),
                        eq(5L),
                        eq("REGISTRO_ACEITE_CLIENTE"),
                        eq("ENVIADA_AO_CLIENTE"),
                        eq("ACEITA"),
                        eq(1L));
        verify(auditoriaService)
                .registrarTransicaoStatus(
                        eq(TipoEntidadeAuditoria.PROJETO),
                        eq(10L),
                        eq("PROPOSTA_ACEITA_CLIENTE"),
                        eq("AGUARDANDO_ACEITE_PROPOSTA"),
                        eq("AGUARDANDO_CONTRATO"),
                        eq(1L));
    }

    @Test
    void registrarConsideracoes_quandoNaoEnviada_deveRetornar400() {
        Proposta proposta = proposta(6L, PropostaStatus.RASCUNHO);
        when(propostaRepository.findById(6L)).thenReturn(Optional.of(proposta));

        var req = new InteracaoFluxoCreateRequest(TipoInteracaoFluxo.CONSIDERACOES_CLIENTE, "Pediu ajuste.", null);
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class, () -> service.registrarRespostaCliente(10L, 6L, req, admin()));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void registrarRecusa_deveAtualizarPropostaParaNegadaECancelarProjeto() {
        Proposta proposta = proposta(8L, PropostaStatus.ENVIADA_AO_CLIENTE, ProjetoStatus.AGUARDANDO_ACEITE_PROPOSTA);
        when(propostaRepository.findById(8L)).thenReturn(Optional.of(proposta));
        when(usuarioRepository.getReferenceById(1L)).thenReturn(new Usuario());
        when(propostaRepository.save(any(Proposta.class))).thenAnswer(inv -> inv.getArgument(0));
        when(projetoRepository.save(any(Projeto.class))).thenAnswer(inv -> inv.getArgument(0));
        when(interacaoFluxoRepository.save(any(InteracaoFluxo.class))).thenAnswer(inv -> {
            InteracaoFluxo i = inv.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(i, "id", 100L);
            Usuario u = new Usuario();
            org.springframework.test.util.ReflectionTestUtils.setField(u, "id", 1L);
            u.setNome("Admin");
            i.setRegistradoPor(u);
            return i;
        });

        var req = new InteracaoFluxoCreateRequest(TipoInteracaoFluxo.RECUSA_CLIENTE, "Não aprovou.", null);
        var res = service.registrarRespostaCliente(10L, 8L, req, admin());

        assertEquals(PropostaStatus.NEGADA, res.proposta().status());
        assertEquals(ProjetoStatus.CANCELADO, proposta.getProjeto().getStatus());
        verify(auditoriaService)
                .registrarTransicaoStatus(
                        eq(TipoEntidadeAuditoria.PROJETO),
                        eq(10L),
                        eq("PROPOSTA_NEGADA_CLIENTE"),
                        eq("AGUARDANDO_ACEITE_PROPOSTA"),
                        eq("CANCELADO"),
                        eq(1L));
    }

    @Test
    void registrarRecusa_quandoColaborador_deveRetornar403() {
        var req = new InteracaoFluxoCreateRequest(TipoInteracaoFluxo.RECUSA_CLIENTE, "Não aprovou.", null);
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> service.registrarRespostaCliente(10L, 7L, req, colab(2L)));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    private static Proposta proposta(long id, PropostaStatus status) {
        return proposta(id, status, ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL);
    }

    private static Proposta proposta(long id, PropostaStatus status, ProjetoStatus projetoStatus) {
        Proposta p = new Proposta();
        org.springframework.test.util.ReflectionTestUtils.setField(p, "id", id);
        Projeto proj = new Projeto();
        org.springframework.test.util.ReflectionTestUtils.setField(proj, "id", 10L);
        proj.setStatus(projetoStatus);
        Usuario criador = new Usuario();
        org.springframework.test.util.ReflectionTestUtils.setField(criador, "id", 2L);
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

    private static UsuarioAutenticado admin() {
        return UsuarioAutenticadoFixtures.administrativo(1L);
    }

    private static UsuarioAutenticado colab(long id) {
        return UsuarioAutenticadoFixtures.colaborador(id);
    }
}
