package br.com.catec.api.v1.proposta;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.catec.api.v1.documento.DocumentoResponse;
import br.com.catec.domain.documento.TipoVinculoDocumento;
import br.com.catec.domain.proposta.PropostaStatus;
import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.security.JwtService;
import br.com.catec.security.SecurityWebMvcTestConfig;
import br.com.catec.security.UsuarioAutenticado;
import br.com.catec.security.UsuarioAutenticadoFixtures;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PropostaController.class)
@AutoConfigureMockMvc
@Import(SecurityWebMvcTestConfig.class)
class PropostaControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PropostaService propostaService;

    @MockBean
    private br.com.catec.api.v1.interacao.InteracaoFluxoService interacaoFluxoService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @Test
    void criar_quandoAdministrativo_deveRetornar201() throws Exception {
        var res = propostaResposta(1L);
        when(propostaService.criar(eq(10L), eq(admin()))).thenReturn(res);

        mockMvc.perform(post("/api/v1/projetos/10/propostas")
                        .with(user(admin()))
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("RASCUNHO"));

        verify(propostaService).criar(eq(10L), eq(admin()));
    }

    @Test
    void aprovarSocio_quandoSocio_deveRetornar200() throws Exception {
        var res = propostaResposta(2L);
        when(propostaService.aprovarPeloSocio(eq(10L), eq(2L), eq(socio()))).thenReturn(res);

        mockMvc.perform(post("/api/v1/projetos/10/propostas/2/aprovar-socio").with(user(socio())).with(csrf()))
                .andExpect(status().isOk());

        verify(propostaService).aprovarPeloSocio(eq(10L), eq(2L), eq(socio()));
    }

    @Test
    void uploadDocumento_quandoAdministrativo_deveRetornar201() throws Exception {
        var doc = new DocumentoResponse(
                5L,
                TipoVinculoDocumento.PROPOSTA,
                1L,
                "PROPOSTA_PDF",
                "prop.pdf",
                "application/pdf",
                100L,
                1,
                1L,
                "Admin",
                Instant.parse("2026-05-19T12:00:00Z"));
        when(propostaService.uploadDocumento(eq(10L), eq(1L), eq("PROPOSTA_PDF"), org.mockito.ArgumentMatchers.any(), eq(admin())))
                .thenReturn(doc);

        MockMultipartFile file =
                new MockMultipartFile("file", "prop.pdf", "application/pdf", new byte[] {1, 2});

        mockMvc.perform(multipart("/api/v1/projetos/10/propostas/1/documentos")
                        .file(file)
                        .param("tipoArquivo", "PROPOSTA_PDF")
                        .with(user(admin()))
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nomeOriginal").value("prop.pdf"));
    }

    @Test
    void listar_quandoSemRole_deveRetornar403() throws Exception {
        mockMvc.perform(get("/api/v1/projetos/10/propostas").with(user(semRole())))
                .andExpect(status().isForbidden());
    }

    private static PropostaResponse propostaResposta(long id) {
        return new PropostaResponse(
                id,
                10L,
                PropostaStatus.RASCUNHO,
                1,
                1L,
                "Admin",
                null,
                null,
                null,
                false,
                null,
                Instant.parse("2026-05-19T10:00:00Z"),
                Instant.parse("2026-05-19T10:00:00Z"));
    }

    private static UsuarioAutenticado admin() {
        return UsuarioAutenticadoFixtures.administrativo(1L);
    }

    private static UsuarioAutenticado socio() {
        return UsuarioAutenticadoFixtures.socio(3L);
    }

    private static UsuarioAutenticado semRole() {
        return UsuarioAutenticadoFixtures.semPermissoes(9L);
    }
}
