package br.com.catec.api.v1.admin.usuario;

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

import br.com.catec.domain.usuario.PerfilMacro;
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
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AdminUsuarioController.class)
@AutoConfigureMockMvc
@Import(MethodSecurityConfig.class)
class AdminUsuarioControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AdminUsuarioService adminUsuarioService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @Test
    void listar_deveRetornar200ComLista() throws Exception {
        when(adminUsuarioService.listar()).thenReturn(List.of(resposta(1L, "Admin", "admin@catec.local")));

        mockMvc.perform(get("/api/v1/admin/usuarios").with(user(adminPrincipal(1L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nome").value("Admin"))
                .andExpect(jsonPath("$[0].email").value("admin@catec.local"));

        verify(adminUsuarioService).listar();
    }

    @Test
    void obter_deveRetornar200ComUsuario() throws Exception {
        when(adminUsuarioService.obter(10L)).thenReturn(resposta(10L, "Fulano", "fulano@catec.local"));

        mockMvc.perform(get("/api/v1/admin/usuarios/10").with(user(adminPrincipal(1L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.nome").value("Fulano"));

        verify(adminUsuarioService).obter(10L);
    }

    @Test
    void criar_quandoPayloadValido_deveRetornar201() throws Exception {
        var req = new UsuarioCreateRequest("Novo", "novo@catec.local", "11999990000", List.of(PerfilMacro.COLABORADOR));
        when(adminUsuarioService.criar(req)).thenReturn(resposta(11L, "Novo", "novo@catec.local"));

        mockMvc.perform(post("/api/v1/admin/usuarios")
                        .with(user(adminPrincipal(1L)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(11))
                .andExpect(jsonPath("$.email").value("novo@catec.local"));

        verify(adminUsuarioService).criar(eq(req));
    }

    @Test
    void criar_quandoPayloadInvalido_deveRetornar400() throws Exception {
        var req = new UsuarioCreateRequest("", "email-invalido", null, List.of());

        mockMvc.perform(post("/api/v1/admin/usuarios")
                        .with(user(adminPrincipal(1L)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void atualizar_quandoPayloadValido_deveRetornar200EPassarOperador() throws Exception {
        Long operadorId = 99L;
        var req = new UsuarioUpdateRequest("Atualizado", "atualizado@catec.local", "11911112222", true, List.of(PerfilMacro.FINANCEIRO));
        when(adminUsuarioService.atualizar(10L, req, operadorId)).thenReturn(resposta(10L, "Atualizado", "atualizado@catec.local"));

        mockMvc.perform(put("/api/v1/admin/usuarios/10")
                        .with(user(adminPrincipal(operadorId)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Atualizado"));

        verify(adminUsuarioService).atualizar(10L, req, operadorId);
    }

    @Test
    void resetarSenha_deveRetornar204() throws Exception {
        mockMvc.perform(post("/api/v1/admin/usuarios/15/resetar-senha")
                        .with(user(adminPrincipal(1L)))
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(adminUsuarioService).resetarSenhaProvisoria(15L);
    }

    @Test
    void listar_quandoSemAutenticacao_deveRetornar401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/usuarios")).andExpect(status().isUnauthorized());
    }

    @Test
    void listar_quandoSemRoleAdministrativo_deveRetornar403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/usuarios").with(user(colaboradorPrincipal(2L))))
                .andExpect(status().isForbidden());
    }

    private static AdminUsuarioResponse resposta(Long id, String nome, String email) {
        return new AdminUsuarioResponse(
                id,
                nome,
                email,
                null,
                true,
                false,
                List.of("ADMINISTRATIVO"),
                Instant.parse("2026-01-01T00:00:00Z"),
                Instant.parse("2026-01-01T00:00:00Z"));
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
