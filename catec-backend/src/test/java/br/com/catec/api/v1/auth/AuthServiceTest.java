package br.com.catec.api.v1.auth;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.com.catec.domain.usuario.PerfilMacro;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioPerfil;
import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.security.JwtService;
import java.time.Instant;
import java.util.ArrayList;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @InjectMocks
    private AuthService service;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = usuario(1L, "admin@catec.local", true, false, PerfilMacro.ADMINISTRATIVO);
    }

    @Test
    void login_comCredenciaisValidas_deveRetornarToken() {
        when(usuarioRepository.findByEmailIgnoreCase("admin@catec.local")).thenReturn(java.util.Optional.of(usuario));
        when(passwordEncoder.matches("password", "hash")).thenReturn(true);
        when(jwtService.generateToken(usuario)).thenReturn("jwt-token");
        when(jwtService.getExpirationSeconds()).thenReturn(28800L);

        var response = service.login(" admin@catec.local ", "password");

        assertEquals("Bearer", response.tokenType());
        assertEquals("jwt-token", response.accessToken());
        assertEquals(28800L, response.expiresInSeconds());
        assertFalse(response.trocaSenhaObrigatoria());
    }

    @Test
    void login_quandoUsuarioNaoExiste_deveLancarBadCredentials() {
        when(usuarioRepository.findByEmailIgnoreCase("inexistente@catec.local")).thenReturn(java.util.Optional.empty());
        assertThrows(BadCredentialsException.class, () -> service.login("inexistente@catec.local", "x"));
    }

    @Test
    void login_quandoSenhaInvalida_deveLancarBadCredentials() {
        when(usuarioRepository.findByEmailIgnoreCase("admin@catec.local")).thenReturn(java.util.Optional.of(usuario));
        when(passwordEncoder.matches("errada", "hash")).thenReturn(false);
        assertThrows(BadCredentialsException.class, () -> service.login("admin@catec.local", "errada"));
    }

    @Test
    void login_quandoInativoSemTrocaSenhaPendente_deveLancarBadCredentials() {
        usuario.setAtivo(false);
        usuario.setRequerTrocaSenha(false);
        when(usuarioRepository.findByEmailIgnoreCase("admin@catec.local")).thenReturn(java.util.Optional.of(usuario));
        when(passwordEncoder.matches("password", "hash")).thenReturn(true);
        assertThrows(BadCredentialsException.class, () -> service.login("admin@catec.local", "password"));
    }

    @Test
    void login_quandoTrocaSenhaPendente_devePermitirERetornarFlag() {
        usuario.setAtivo(false);
        usuario.setRequerTrocaSenha(true);
        when(usuarioRepository.findByEmailIgnoreCase("admin@catec.local")).thenReturn(java.util.Optional.of(usuario));
        when(passwordEncoder.matches("password", "hash")).thenReturn(true);
        when(jwtService.generateToken(usuario)).thenReturn("jwt-token");
        when(jwtService.getExpirationSeconds()).thenReturn(28800L);

        var response = service.login("admin@catec.local", "password");
        assertTrue(response.trocaSenhaObrigatoria());
    }

    @Test
    void definirNovaSenha_quandoInvalida_deveLancarBadRequest() {
        var ex = assertThrows(ResponseStatusException.class, () -> service.definirNovaSenha(1L, "fraca"));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void definirNovaSenha_quandoUsuarioNaoExiste_deveLancarNotFound() {
        when(usuarioRepository.findById(1L)).thenReturn(java.util.Optional.empty());
        var ex = assertThrows(ResponseStatusException.class, () -> service.definirNovaSenha(1L, "Senha@Definitiva123"));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void definirNovaSenha_quandoNaoHaPendencia_deveLancarBadRequest() {
        usuario.setRequerTrocaSenha(false);
        when(usuarioRepository.findById(1L)).thenReturn(java.util.Optional.of(usuario));
        var ex = assertThrows(ResponseStatusException.class, () -> service.definirNovaSenha(1L, "Senha@Definitiva123"));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void definirNovaSenha_comSucesso_deveAtivarContaRemoverPendenciaERetornarToken() {
        usuario.setAtivo(false);
        usuario.setRequerTrocaSenha(true);
        when(usuarioRepository.findById(1L)).thenReturn(java.util.Optional.of(usuario), java.util.Optional.of(usuario));
        when(passwordEncoder.encode("Senha@Definitiva123")).thenReturn("novo-hash");
        when(jwtService.generateToken(any(Usuario.class))).thenReturn("novo-token");
        when(jwtService.getExpirationSeconds()).thenReturn(28800L);

        var response = service.definirNovaSenha(1L, "Senha@Definitiva123");

        assertEquals("novo-token", response.accessToken());
        assertFalse(response.trocaSenhaObrigatoria());
        assertTrue(usuario.isAtivo());
        assertFalse(usuario.isRequerTrocaSenha());
        assertEquals("novo-hash", usuario.getSenhaHash());
        verify(usuarioRepository).save(usuario);
    }

    private static Usuario usuario(long id, String email, boolean ativo, boolean trocaSenha, PerfilMacro... perfisMacro) {
        var u = new Usuario();
        ReflectionTestUtils.setField(u, "id", id);
        u.setNome("Usuário");
        u.setEmail(email);
        u.setSenhaHash("hash");
        u.setAtivo(ativo);
        u.setRequerTrocaSenha(trocaSenha);
        u.setCriadoEm(Instant.now());
        u.setAtualizadoEm(Instant.now());
        var perfis = new ArrayList<UsuarioPerfil>();
        for (PerfilMacro macro : perfisMacro) perfis.add(UsuarioPerfil.associar(u, macro));
        u.setPerfis(perfis);
        return u;
    }
}
