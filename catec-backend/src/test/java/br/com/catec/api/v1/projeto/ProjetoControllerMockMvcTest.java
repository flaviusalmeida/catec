package br.com.catec.api.v1.projeto;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.security.JwtService;
import br.com.catec.security.MethodSecurityConfig;
import br.com.catec.security.UsuarioAutenticado;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProjetoController.class)
@AutoConfigureMockMvc
@Import(MethodSecurityConfig.class)
class ProjetoControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProjetoService projetoService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @Test
    void listar_quandoColaborador_deveRetornar200() throws Exception {
        when(projetoService.listar(eq(colab(2L)))).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/projetos").with(user(colab(2L)))).andExpect(status().isOk());

        verify(projetoService).listar(eq(colab(2L)));
    }

    @Test
    void listar_quandoSemRoleColaboradorOuAdm_deveRetornar403() throws Exception {
        var socio = new UsuarioAutenticado(
                9L, "socio@catec.local", "Sócio", false, List.of(new SimpleGrantedAuthority("ROLE_SOCIO")));

        mockMvc.perform(get("/api/v1/projetos").with(user(socio))).andExpect(status().isForbidden());
    }

    @Test
    void criar_quandoPayloadValido_deveRetornar201() throws Exception {
        var body = new ProjetoCreateRequest(1L, "Título", "Escopo", "mail@cliente.com", "11988887777");
        var res = new ProjetoResponse(
                10L,
                1L,
                "Cliente X",
                "Título",
                "Escopo",
                "mail@cliente.com",
                "11988887777",
                2L,
                "Colab",
                ProjetoStatus.CRIADO,
                Instant.parse("2026-01-01T12:00:00Z"),
                Instant.parse("2026-01-01T12:00:00Z"));
        when(projetoService.criar(eq(body), eq(colab(2L)))).thenReturn(res);

        mockMvc.perform(post("/api/v1/projetos")
                        .with(user(colab(2L)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.status").value("CRIADO"));

        verify(projetoService).criar(eq(body), eq(colab(2L)));
    }

    @Test
    void atualizar_quandoAdmin_deveRetornar200() throws Exception {
        var body = new ProjetoUpdateRequest(null, null, null, null, null, ProjetoStatus.AGUARDANDO_ADM);
        var res = new ProjetoResponse(
                5L,
                1L,
                "Cliente X",
                "T",
                "E",
                "a@b.com",
                null,
                2L,
                "Colab",
                ProjetoStatus.AGUARDANDO_ADM,
                Instant.parse("2026-01-01T12:00:00Z"),
                Instant.parse("2026-01-02T12:00:00Z"));
        when(projetoService.atualizar(eq(5L), eq(body), eq(adm(1L)))).thenReturn(res);

        mockMvc.perform(put("/api/v1/projetos/5")
                        .with(user(adm(1L)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AGUARDANDO_ADM"));

        verify(projetoService).atualizar(eq(5L), eq(body), eq(adm(1L)));
    }

    private static UsuarioAutenticado colab(Long id) {
        return new UsuarioAutenticado(
                id, "colab@catec.local", "Colab", false, List.of(new SimpleGrantedAuthority("ROLE_COLABORADOR")));
    }

    private static UsuarioAutenticado adm(Long id) {
        return new UsuarioAutenticado(
                id, "admin@catec.local", "Admin", false, List.of(new SimpleGrantedAuthority("ROLE_ADMINISTRATIVO")));
    }
}
