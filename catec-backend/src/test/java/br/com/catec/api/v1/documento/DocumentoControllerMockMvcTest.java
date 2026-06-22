package br.com.catec.api.v1.documento;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.catec.domain.documento.TipoVinculoDocumento;
import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.security.JwtService;
import br.com.catec.security.SecurityWebMvcTestConfig;
import br.com.catec.security.UsuarioAutenticado;
import br.com.catec.security.UsuarioAutenticadoFixtures;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DocumentoController.class)
@AutoConfigureMockMvc
@Import(SecurityWebMvcTestConfig.class)
class DocumentoControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DocumentoService documentoService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @Test
    void upload_quandoAutenticado_deveRetornar201() throws Exception {
        var res = new DocumentoResponse(
                1L,
                TipoVinculoDocumento.PROJETO,
                10L,
                "ANEXO",
                "doc.pdf",
                "application/pdf",
                100L,
                1,
                2L,
                "Colab",
                Instant.parse("2026-05-19T12:00:00Z"));
        when(documentoService.upload(
                        eq(TipoVinculoDocumento.PROJETO),
                        eq(10L),
                        eq("ANEXO"),
                        any(),
                        eq(colab(2L))))
                .thenReturn(res);

        MockMultipartFile file =
                new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[] {1, 2, 3});

        mockMvc.perform(multipart("/api/v1/documentos")
                        .file(file)
                        .param("tipoVinculo", "PROJETO")
                        .param("vinculoId", "10")
                        .param("tipoArquivo", "ANEXO")
                        .with(user(colab(2L)))
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.versao").value(1));

        verify(documentoService)
                .upload(eq(TipoVinculoDocumento.PROJETO), eq(10L), eq("ANEXO"), any(), eq(colab(2L)));
    }

    @Test
    void download_quandoAutenticado_deveRetornarStream() throws Exception {
        var resource = new ByteArrayResource("conteudo".getBytes());
        when(documentoService.obterConteudo(eq(5L), eq(colab(2L))))
                .thenReturn(new DocumentoService.DocumentoDownload("rel.pdf", "application/pdf", 8L, resource));

        mockMvc.perform(get("/api/v1/documentos/5/conteudo").with(user(colab(2L))))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", MediaType.APPLICATION_PDF_VALUE))
                .andExpect(header().exists("Content-Disposition"));

        verify(documentoService).obterConteudo(eq(5L), eq(colab(2L)));
    }

    @Test
    void download_quandoServicoNegarAcesso_deveRetornar403() throws Exception {
        when(documentoService.obterConteudo(eq(6L), eq(colab(2L))))
                .thenThrow(new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.FORBIDDEN, "Acesso negado"));

        mockMvc.perform(get("/api/v1/documentos/6/conteudo").with(user(colab(2L))))
                .andExpect(status().isForbidden());
    }

    @Test
    void upload_quandoSemRole_deveRetornar403() throws Exception {
        MockMultipartFile file =
                new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[] {1});

        mockMvc.perform(multipart("/api/v1/documentos")
                        .file(file)
                        .param("tipoVinculo", "PROJETO")
                        .param("vinculoId", "1")
                        .with(user(UsuarioAutenticadoFixtures.semPermissoes(9L))))
                .andExpect(status().isForbidden());
    }

    private static UsuarioAutenticado colab(long id) {
        return UsuarioAutenticadoFixtures.colaborador(id);
    }
}
