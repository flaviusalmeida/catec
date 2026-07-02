package br.com.catec.api.v1.proposta;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SocioPropostaController.class)
@AutoConfigureMockMvc
@Import(SecurityWebMvcTestConfig.class)
class SocioPropostaControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PropostaService propostaService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @Test
    void listarPendentes_quandoSocio_deveRetornar200() throws Exception {
        when(propostaService.listarPendentesSocio(eq(socio()))).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/socio/propostas/pendentes").with(user(socio()))).andExpect(status().isOk());

        verify(propostaService).listarPendentesSocio(eq(socio()));
    }

    @Test
    void aprovar_quandoSocio_deveRetornar200() throws Exception {
        var res = propostaResposta(5L);
        when(propostaService.aprovarPeloSocio(eq(10L), eq(5L), eq("Ok"), eq(socio()))).thenReturn(res);

        mockMvc.perform(post("/api/v1/socio/propostas/5/aprovar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"projetoId\":10,\"observacao\":\"Ok\"}")
                        .with(user(socio()))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RASCUNHO"));

        verify(propostaService).aprovarPeloSocio(eq(10L), eq(5L), eq("Ok"), eq(socio()));
    }

    @Test
    void aprovar_quandoColaborador_deveRetornar403() throws Exception {
        mockMvc.perform(post("/api/v1/socio/propostas/5/aprovar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"projetoId\":10}")
                        .with(user(UsuarioAutenticadoFixtures.colaborador(2L))))
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
                Instant.parse("2026-05-19T12:00:00Z"),
                3L,
                false,
                null,
                Instant.parse("2026-05-19T10:00:00Z"),
                Instant.parse("2026-05-19T12:00:00Z"));
    }

    private static UsuarioAutenticado socio() {
        return UsuarioAutenticadoFixtures.socio(3L);
    }
}
