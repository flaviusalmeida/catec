package br.com.catec.api.v1.documento;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.catec.config.AppDocumentoProperties;
import br.com.catec.domain.documento.Documento;
import br.com.catec.domain.documento.DocumentoRepository;
import br.com.catec.domain.documento.TipoVinculoDocumento;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.security.UsuarioAutenticado;
import br.com.catec.storage.DocumentStorage;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class DocumentoServiceTest {

    @Mock
    private DocumentoRepository documentoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ProjetoRepository projetoRepository;

    @Mock
    private br.com.catec.domain.proposta.PropostaRepository propostaRepository;

    @Mock
    private br.com.catec.domain.contrato.ContratoRepository contratoRepository;

    @Mock
    private DocumentoAutorizacaoService documentoAutorizacaoService;

    @Mock
    private DocumentStorage documentStorage;

    @Mock
    private MultipartFile multipartFile;

    @InjectMocks
    private DocumentoService service;

    private AppDocumentoProperties properties;
    private UsuarioAutenticado principal;

    @TempDir
    java.nio.file.Path tempDir;

    @BeforeEach
    void setUp() {
        properties = new AppDocumentoProperties();
        properties.setMaxSizeBytes(1024 * 1024);
        properties.getStorage().getLocal().setBaseDir(tempDir.toString());
        service = new DocumentoService(
                documentoRepository,
                usuarioRepository,
                projetoRepository,
                propostaRepository,
                contratoRepository,
                documentoAutorizacaoService,
                documentStorage,
                properties);
        principal = new UsuarioAutenticado(2L, "colab@catec.local", "Colab", false, List.of(new SimpleGrantedAuthority("ROLE_COLABORADOR")));
    }

    @Test
    void upload_quandoValido_devePersistirVersaoInicial() throws Exception {
        when(projetoRepository.existsById(10L)).thenReturn(true);
        when(documentoRepository.findMaxVersao(TipoVinculoDocumento.PROJETO, 10L)).thenReturn(0);
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(4L);
        when(multipartFile.getContentType()).thenReturn("application/pdf");
        when(multipartFile.getOriginalFilename()).thenReturn("proposta.pdf");
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream("pdf".getBytes(StandardCharsets.UTF_8)));

        Usuario uploader = new Usuario();
        org.springframework.test.util.ReflectionTestUtils.setField(uploader, "id", 2L);
        uploader.setNome("Colab");
        when(usuarioRepository.getReferenceById(2L)).thenReturn(uploader);

        when(documentoRepository.save(any(Documento.class))).thenAnswer(inv -> {
            Documento d = inv.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(d, "id", 99L);
            return d;
        });

        DocumentoResponse res = service.upload(TipoVinculoDocumento.PROJETO, 10L, "ANEXO", multipartFile, principal);

        assertEquals(99L, res.id());
        assertEquals(1, res.versao());
        assertEquals("proposta.pdf", res.nomeOriginal());
        assertEquals("application/pdf", res.mimeType());

        ArgumentCaptor<Documento> captor = ArgumentCaptor.forClass(Documento.class);
        verify(documentoRepository).save(captor.capture());
        assertEquals(1, captor.getValue().getVersao());
        verify(documentStorage).store(any(String.class), any(), eq(4L));
    }

    @Test
    void upload_quandoProposta_deveIndicarEndpointAninhado() {
        when(multipartFile.isEmpty()).thenReturn(false);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> service.upload(TipoVinculoDocumento.PROPOSTA, 1L, null, multipartFile, principal));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void upload_quandoMimeNaoPermitido_deveRetornar400() {
        when(projetoRepository.existsById(1L)).thenReturn(true);
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(10L);
        when(multipartFile.getContentType()).thenReturn("application/x-msdownload");

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> service.upload(TipoVinculoDocumento.PROJETO, 1L, null, multipartFile, principal));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void upload_segundaVersao_deveIncrementar() throws Exception {
        when(projetoRepository.existsById(5L)).thenReturn(true);
        when(documentoRepository.findMaxVersao(TipoVinculoDocumento.PROJETO, 5L)).thenReturn(2);
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(2L);
        when(multipartFile.getContentType()).thenReturn("application/pdf");
        when(multipartFile.getOriginalFilename()).thenReturn("v2.pdf");
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream("ok".getBytes(StandardCharsets.UTF_8)));
        Usuario uploader = new Usuario();
        org.springframework.test.util.ReflectionTestUtils.setField(uploader, "id", 2L);
        uploader.setNome("Colab");
        when(usuarioRepository.getReferenceById(2L)).thenReturn(uploader);
        when(documentoRepository.save(any(Documento.class))).thenAnswer(inv -> inv.getArgument(0));

        DocumentoResponse res = service.upload(TipoVinculoDocumento.PROJETO, 5L, null, multipartFile, principal);

        assertEquals(3, res.versao());
    }

    @Test
    void obterConteudo_quandoAutorizado_deveRetornarResource() {
        Documento doc = new Documento();
        org.springframework.test.util.ReflectionTestUtils.setField(doc, "id", 7L);
        doc.setTipoVinculo(TipoVinculoDocumento.PROJETO);
        doc.setVinculoId(10L);
        doc.setNomeOriginal("a.pdf");
        doc.setMimeType("application/pdf");
        doc.setTamanhoBytes(3);
        doc.setChaveStorage("2026/05/key");
        when(documentoRepository.findById(7L)).thenReturn(Optional.of(doc));
        when(documentStorage.loadAsResource("2026/05/key"))
                .thenReturn(new ByteArrayResource("abc".getBytes(StandardCharsets.UTF_8)));

        DocumentoService.DocumentoDownload download = service.obterConteudo(7L, principal);

        assertEquals("a.pdf", download.nomeOriginal());
        assertEquals("application/pdf", download.mimeType());
        verify(documentoAutorizacaoService).garantirLeitura(doc, principal);
    }

    @Test
    void obterConteudo_quandoSemPermissao_deveRetornar403() {
        Documento doc = new Documento();
        org.springframework.test.util.ReflectionTestUtils.setField(doc, "id", 8L);
        doc.setTipoVinculo(TipoVinculoDocumento.PROJETO);
        doc.setVinculoId(10L);
        when(documentoRepository.findById(8L)).thenReturn(Optional.of(doc));
        doThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "negado"))
                .when(documentoAutorizacaoService)
                .garantirLeitura(doc, principal);

        ResponseStatusException ex =
                assertThrows(ResponseStatusException.class, () -> service.obterConteudo(8L, principal));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(documentStorage, org.mockito.Mockito.never()).loadAsResource(org.mockito.ArgumentMatchers.any());
    }
}
