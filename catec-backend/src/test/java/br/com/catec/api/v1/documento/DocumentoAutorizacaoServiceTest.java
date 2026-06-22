package br.com.catec.api.v1.documento;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import br.com.catec.domain.documento.Documento;
import br.com.catec.domain.documento.TipoVinculoDocumento;
import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.proposta.Proposta;
import br.com.catec.domain.proposta.PropostaRepository;
import br.com.catec.domain.usuario.Usuario;
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
class DocumentoAutorizacaoServiceTest {

    @Mock
    private ProjetoRepository projetoRepository;

    @Mock
    private PropostaRepository propostaRepository;

    @Mock
    private br.com.catec.domain.contrato.ContratoRepository contratoRepository;

    @Spy
    private AuthorizationService authz = new AuthorizationService();

    @InjectMocks
    private DocumentoAutorizacaoService service;

    @Test
    void garantirLeitura_administrativo_devePermitirProjeto() {
        Documento doc = documentoProjeto(1L, 10L);

        assertDoesNotThrow(() -> service.garantirLeitura(doc, admin(1L)));
    }

    @Test
    void garantirLeitura_colaboradorCriadorDoProjeto_devePermitir() {
        Documento doc = documentoProjeto(1L, 10L);
        when(projetoRepository.findById(10L)).thenReturn(Optional.of(projetoComCriador(10L, 2L)));

        assertDoesNotThrow(() -> service.garantirLeitura(doc, colab(2L)));
    }

    @Test
    void garantirLeitura_colaboradorNaoCriador_deveRetornar403() {
        Documento doc = documentoProjeto(1L, 10L);
        when(projetoRepository.findById(10L)).thenReturn(Optional.of(projetoComCriador(10L, 99L)));

        ResponseStatusException ex =
                assertThrows(ResponseStatusException.class, () -> service.garantirLeitura(doc, colab(2L)));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void garantirLeitura_socioEmDocumentoProposta_devePermitir() {
        Documento doc = documentoProposta(2L, 20L);

        assertDoesNotThrow(() -> service.garantirLeitura(doc, socio(3L)));
    }

    @Test
    void garantirEscrita_colaboradorEmProposta_deveRetornar403() {
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> service.garantirEscrita(TipoVinculoDocumento.PROPOSTA, 20L, colab(2L)));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void garantirLeitura_colaboradorEmDocumentoNf_deveRetornar403() {
        Documento doc = new Documento();
        doc.setTipoVinculo(TipoVinculoDocumento.NF);
        doc.setVinculoId(5L);

        ResponseStatusException ex =
                assertThrows(ResponseStatusException.class, () -> service.garantirLeitura(doc, colab(2L)));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    private static Documento documentoProjeto(long docId, long projetoId) {
        Documento doc = new Documento();
        org.springframework.test.util.ReflectionTestUtils.setField(doc, "id", docId);
        doc.setTipoVinculo(TipoVinculoDocumento.PROJETO);
        doc.setVinculoId(projetoId);
        return doc;
    }

    private static Projeto projetoComCriador(long projetoId, long criadorId) {
        Projeto p = new Projeto();
        org.springframework.test.util.ReflectionTestUtils.setField(p, "id", projetoId);
        Usuario criador = new Usuario();
        org.springframework.test.util.ReflectionTestUtils.setField(criador, "id", criadorId);
        p.setCriadoPor(criador);
        return p;
    }

    private static UsuarioAutenticado admin(long id) {
        return UsuarioAutenticadoFixtures.administrativo(id);
    }

    private static UsuarioAutenticado colab(long id) {
        return UsuarioAutenticadoFixtures.colaborador(id);
    }

    private static UsuarioAutenticado socio(long id) {
        return UsuarioAutenticadoFixtures.socio(id);
    }

    private static Documento documentoProposta(long docId, long propostaId) {
        Documento doc = new Documento();
        org.springframework.test.util.ReflectionTestUtils.setField(doc, "id", docId);
        doc.setTipoVinculo(TipoVinculoDocumento.PROPOSTA);
        doc.setVinculoId(propostaId);
        return doc;
    }

    private static Proposta propostaDoProjeto(long propostaId, long projetoId) {
        Proposta p = new Proposta();
        org.springframework.test.util.ReflectionTestUtils.setField(p, "id", propostaId);
        Projeto proj = projetoComCriador(projetoId, 2L);
        p.setProjeto(proj);
        return p;
    }
}
