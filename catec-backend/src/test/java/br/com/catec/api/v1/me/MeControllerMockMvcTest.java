package br.com.catec.api.v1.me;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.catec.domain.acesso.PermissaoResolver;
import br.com.catec.security.UsuarioAutenticado;
import br.com.catec.security.JwtService;
import br.com.catec.domain.usuario.UsuarioRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(MeController.class)
@AutoConfigureMockMvc
class MeControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MeService meService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @MockBean
    private PermissaoResolver permissaoResolver;

    @Test
    void me_quandoAutenticado_deveRetornar200ComPerfil() throws Exception {
        var principal = usuarioAutenticado(7L);
        var response = new MeResponse(
                7L,
                "Usuário Teste",
                "user@catec.local",
                List.of("ADMINISTRATIVO", "SOCIO"),
                List.of("tela.painel", "acao.grupo.gerir"),
                true,
                "11999990000",
                false);
        when(meService.obterPerfil(7L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/me").with(user(principal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.nome").value("Usuário Teste"))
                .andExpect(jsonPath("$.email").value("user@catec.local"))
                .andExpect(jsonPath("$.grupos[0]").value("ADMINISTRATIVO"))
                .andExpect(jsonPath("$.grupos[1]").value("SOCIO"))
                .andExpect(jsonPath("$.permissoes[0]").value("tela.painel"))
                .andExpect(jsonPath("$.permissoes[1]").value("acao.grupo.gerir"))
                .andExpect(jsonPath("$.ativo").value(true))
                .andExpect(jsonPath("$.telefone").value("11999990000"))
                .andExpect(jsonPath("$.requerTrocaSenha").value(false));

        verify(meService).obterPerfil(7L);
    }

    @Test
    void me_quandoSemAutenticacao_deveRetornar401() throws Exception {
        mockMvc.perform(get("/api/v1/me")).andExpect(status().isUnauthorized());
    }

    private static UsuarioAutenticado usuarioAutenticado(Long id) {
        return UsuarioAutenticado.comAutoridades(
                id,
                "user@catec.local",
                "Usuário Teste",
                false,
                List.of(
                        new SimpleGrantedAuthority("ROLE_ADMINISTRATIVO"),
                        new SimpleGrantedAuthority("acao.grupo.gerir")));
    }
}
