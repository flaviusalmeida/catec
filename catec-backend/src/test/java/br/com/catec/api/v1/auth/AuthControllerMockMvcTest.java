package br.com.catec.api.v1.auth;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.catec.security.UsuarioAutenticado;
import br.com.catec.security.JwtService;
import br.com.catec.domain.usuario.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc
class AuthControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @Test
    void login_quandoPayloadValido_deveRetornar200ComToken() throws Exception {
        var response = new LoginResponse("Bearer", "jwt-token", 28800L, false);
        when(authService.login("admin@catec.local", "password")).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(user(usuarioAutenticado(1L)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin@catec.local", "password"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.expiresInSeconds").value(28800))
                .andExpect(jsonPath("$.trocaSenhaObrigatoria").value(false));

        verify(authService).login("admin@catec.local", "password");
    }

    @Test
    void login_quandoPayloadInvalido_deveRetornar400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .with(user(usuarioAutenticado(1L)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("", ""))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void trocarSenha_quandoAutenticadoEValido_deveRetornar200() throws Exception {
        var principal = usuarioAutenticado(10L);
        var response = new LoginResponse("Bearer", "novo-token", 28800L, false);
        when(authService.definirNovaSenha(10L, "Senha@Definitiva123")).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/trocar-senha")
                        .with(user(principal))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new NovaSenhaRequest("Senha@Definitiva123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("novo-token"))
                .andExpect(jsonPath("$.trocaSenhaObrigatoria").value(false));

        verify(authService).definirNovaSenha(eq(10L), eq("Senha@Definitiva123"));
    }

    @Test
    void trocarSenha_quandoSemAutenticacao_deveRetornar401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/trocar-senha")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new NovaSenhaRequest("Senha@Definitiva123"))))
                .andExpect(status().isUnauthorized());
    }

    private static UsuarioAutenticado usuarioAutenticado(Long id) {
        return new UsuarioAutenticado(
                id,
                "admin@catec.local",
                "Administrador",
                false,
                List.of(new SimpleGrantedAuthority("ROLE_ADMINISTRATIVO")));
    }
}
