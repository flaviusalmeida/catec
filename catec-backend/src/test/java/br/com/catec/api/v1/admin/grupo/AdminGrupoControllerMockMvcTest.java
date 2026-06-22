package br.com.catec.api.v1.admin.grupo;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.security.JwtService;
import br.com.catec.security.GrupoSecurityWebMvcTestConfig;
import br.com.catec.security.UsuarioAutenticado;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AdminGrupoController.class)
@AutoConfigureMockMvc
@Import(GrupoSecurityWebMvcTestConfig.class)
class AdminGrupoControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminGrupoService adminGrupoService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @Test
    void listar_quandoTemPermissao_deveRetornar200() throws Exception {
        when(adminGrupoService.listar())
                .thenReturn(List.of(new GrupoResponse(
                        1L,
                        "ADMINISTRATIVO",
                        "Administrativo",
                        "Grupo padrão",
                        true,
                        true,
                        List.of("tela.painel"),
                        Instant.parse("2026-01-01T00:00:00Z"),
                        Instant.parse("2026-01-01T00:00:00Z"))));

        mockMvc.perform(get("/api/v1/admin/grupos").with(user(adminComPermissao())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigo").value("ADMINISTRATIVO"));
    }

    @Test
    void listar_quandoSemPermissao_deveRetornar403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/grupos").with(user(adminSemPermissao())))
                .andExpect(status().isForbidden());
    }

    private static UsuarioAutenticado adminComPermissao() {
        return UsuarioAutenticado.comAutoridades(
                1L,
                "admin@catec.local",
                "Admin",
                false,
                List.of(
                        new SimpleGrantedAuthority("ROLE_ADMINISTRATIVO"),
                        new SimpleGrantedAuthority("acao.grupo.gerir")));
    }

    private static UsuarioAutenticado adminSemPermissao() {
        return UsuarioAutenticado.comAutoridades(
                1L,
                "colab@catec.local",
                "Colab",
                false,
                List.of(new SimpleGrantedAuthority("ROLE_COLABORADOR")));
    }
}
