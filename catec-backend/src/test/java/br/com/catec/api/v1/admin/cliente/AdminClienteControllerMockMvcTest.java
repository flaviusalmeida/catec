package br.com.catec.api.v1.admin.cliente;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.catec.domain.cliente.TipoPessoa;
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

@WebMvcTest(AdminClienteController.class)
@AutoConfigureMockMvc
@Import(MethodSecurityConfig.class)
class AdminClienteControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AdminClienteService adminClienteService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @Test
    void listar_deveRetornar200ComLista() throws Exception {
        when(adminClienteService.listar()).thenReturn(List.of(response(1L, "Cliente A")));

        mockMvc.perform(get("/api/v1/admin/clientes").with(user(adminPrincipal(1L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].razaoSocialOuNome").value("Cliente A"));

        verify(adminClienteService).listar();
    }

    @Test
    void obter_deveRetornar200() throws Exception {
        when(adminClienteService.obter(5L)).thenReturn(response(5L, "Cliente B"));

        mockMvc.perform(get("/api/v1/admin/clientes/5").with(user(adminPrincipal(1L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5));

        verify(adminClienteService).obter(5L);
    }

    @Test
    void criar_quandoPayloadValido_deveRetornar201() throws Exception {
        ClienteRequest req = new ClienteRequest(
                TipoPessoa.PF,
                "Cliente C",
                null,
                "52998224725",
                "cliente@catec.local",
                "11988887777",
                null,
                null,
                null,
                null,
                null,
                null,
                null);
        when(adminClienteService.criar(req)).thenReturn(response(10L, "Cliente C"));

        mockMvc.perform(post("/api/v1/admin/clientes")
                        .with(user(adminPrincipal(1L)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10));

        verify(adminClienteService).criar(eq(req));
    }

    @Test
    void criar_quandoPayloadInvalido_deveRetornar400() throws Exception {
        ClienteRequest req = new ClienteRequest(null, "", null, "", "", "", null, null, null, null, null, null, null);

        mockMvc.perform(post("/api/v1/admin/clientes")
                        .with(user(adminPrincipal(1L)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void criar_quandoEmailFormatoInvalido_deveRetornar400() throws Exception {
        ClienteRequest req = new ClienteRequest(
                TipoPessoa.PF,
                "X",
                null,
                "52998224725",
                "email-sem-arroba",
                "11988887777",
                null,
                null,
                null,
                null,
                null,
                null,
                null);

        mockMvc.perform(post("/api/v1/admin/clientes")
                        .with(user(adminPrincipal(1L)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void atualizar_quandoPayloadValido_deveRetornar200() throws Exception {
        ClienteRequest req = new ClienteRequest(
                TipoPessoa.PJ,
                "Cliente D",
                null,
                "11444777000161",
                "pj@catec.local",
                "1133334444",
                null,
                null,
                null,
                null,
                null,
                null,
                null);
        when(adminClienteService.atualizar(4L, req)).thenReturn(response(4L, "Cliente D"));

        mockMvc.perform(put("/api/v1/admin/clientes/4")
                        .with(user(adminPrincipal(1L)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.razaoSocialOuNome").value("Cliente D"));

        verify(adminClienteService).atualizar(4L, req);
    }

    @Test
    void remover_deveRetornar204() throws Exception {
        mockMvc.perform(delete("/api/v1/admin/clientes/8").with(user(adminPrincipal(1L))).with(csrf()))
                .andExpect(status().isNoContent());

        verify(adminClienteService).remover(8L);
    }

    @Test
    void listar_quandoSemAutenticacao_deveRetornar401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/clientes")).andExpect(status().isUnauthorized());
    }

    @Test
    void listar_quandoSemRoleAdministrativo_deveRetornar403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/clientes").with(user(colaboradorPrincipal(2L))))
                .andExpect(status().isForbidden());
    }

    private static ClienteResponse response(Long id, String nome) {
        return new ClienteResponse(
                id,
                TipoPessoa.PF,
                nome,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                Instant.now(),
                Instant.now());
    }

    private static UsuarioAutenticado adminPrincipal(Long id) {
        return new UsuarioAutenticado(
                id,
                "admin@catec.local",
                "Administrador",
                false,
                List.of(new SimpleGrantedAuthority("ROLE_ADMINISTRATIVO")));
    }

    private static UsuarioAutenticado colaboradorPrincipal(Long id) {
        return new UsuarioAutenticado(
                id,
                "colab@catec.local",
                "Colaborador",
                false,
                List.of(new SimpleGrantedAuthority("ROLE_COLABORADOR")));
    }
}
