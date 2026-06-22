package br.com.catec.api.v1.contrato;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.catec.domain.auditoria.AuditoriaService;
import br.com.catec.domain.auditoria.TipoEntidadeAuditoria;
import br.com.catec.domain.contrato.Contrato;
import br.com.catec.domain.contrato.ContratoRepository;
import br.com.catec.domain.contrato.ContratoStatus;
import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.projeto.ProjetoStatus;
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
class ContratoServiceTest {

    @Mock
    private ContratoRepository contratoRepository;

    @Mock
    private ProjetoRepository projetoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AuditoriaService auditoriaService;

    @Mock
    private br.com.catec.api.v1.documento.DocumentoService documentoService;

    @Mock
    private br.com.catec.domain.documento.DocumentoRepository documentoRepository;

    @Spy
    private AuthorizationService authz = new AuthorizationService();

    @InjectMocks
    private ContratoService service;

    @Test
    void criar_quandoAguardandoContrato_deveCriarRascunho() {
        Projeto projeto = projeto(1L, ProjetoStatus.AGUARDANDO_CONTRATO);
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        when(contratoRepository.existsByProjetoId(1L)).thenReturn(false);
        when(usuarioRepository.getReferenceById(10L)).thenReturn(new Usuario());
        when(contratoRepository.save(any(Contrato.class))).thenAnswer(inv -> {
            Contrato c = inv.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(c, "id", 50L);
            return c;
        });

        var res = service.criar(1L, admin(10L));

        assertEquals(ContratoStatus.RASCUNHO, res.status());
        verify(auditoriaService)
                .registrarTransicaoStatus(
                        eq(TipoEntidadeAuditoria.CONTRATO),
                        eq(50L),
                        eq("CRIAR"),
                        eq(null),
                        eq("RASCUNHO"),
                        eq(10L));
    }

    @Test
    void criar_quandoStatusProjetoInvalido_deveRetornar400() {
        Projeto projeto = projeto(2L, ProjetoStatus.ELABORANDO_PROPOSTA);
        when(projetoRepository.findById(2L)).thenReturn(Optional.of(projeto));

        ResponseStatusException ex =
                assertThrows(ResponseStatusException.class, () -> service.criar(2L, admin(10L)));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    private static Projeto projeto(long id, ProjetoStatus status) {
        Projeto p = new Projeto();
        org.springframework.test.util.ReflectionTestUtils.setField(p, "id", id);
        p.setStatus(status);
        Usuario criador = new Usuario();
        org.springframework.test.util.ReflectionTestUtils.setField(criador, "id", 1L);
        p.setCriadoPor(criador);
        return p;
    }

    private static UsuarioAutenticado admin(long id) {
        return UsuarioAutenticadoFixtures.administrativo(id);
    }
}
