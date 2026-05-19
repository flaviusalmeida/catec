package br.com.catec.api.v1.painel;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.catec.api.v1.common.PageResponse;
import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.security.JwtService;
import br.com.catec.security.MethodSecurityConfig;
import br.com.catec.security.UsuarioAutenticado;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PainelController.class)
@AutoConfigureMockMvc
@Import(MethodSecurityConfig.class)
class PainelControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PainelService painelService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @Test
    void resumo_quandoAutenticado_deveRetornar200() throws Exception {
        when(painelService.resumo(eq(admin()), eq(null), eq(null), eq(null), eq(0), eq(20)))
                .thenReturn(PageResponse.of(List.of(), 0, 20, 0));

        mockMvc.perform(get("/api/v1/painel/resumo").with(user(admin()))).andExpect(status().isOk());

        verify(painelService).resumo(eq(admin()), eq(null), eq(null), eq(null), eq(0), eq(20));
    }

    @Test
    void indicadores_quandoColaborador_deveRetornar200() throws Exception {
        when(painelService.indicadores(eq(colab(3L))))
                .thenReturn(new PainelIndicadoresResponse(0, 0, 0, 0, 0));

        mockMvc.perform(get("/api/v1/painel/indicadores").with(user(colab(3L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projetosPendentesCliente").value(0));
    }

    private static UsuarioAutenticado admin() {
        return new UsuarioAutenticado(
                1L, "admin@catec.local", "Admin", false, List.of(new SimpleGrantedAuthority("ROLE_ADMINISTRATIVO")));
    }

    private static UsuarioAutenticado colab(long id) {
        return new UsuarioAutenticado(
                id, "c@test.local", "Colab", false, List.of(new SimpleGrantedAuthority("ROLE_COLABORADOR")));
    }
}
