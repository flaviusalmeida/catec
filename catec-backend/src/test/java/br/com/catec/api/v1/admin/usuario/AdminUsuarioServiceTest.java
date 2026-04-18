package br.com.catec.api.v1.admin.usuario;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.catec.domain.usuario.PerfilMacro;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioPerfil;
import br.com.catec.domain.usuario.UsuarioPerfilRepository;
import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.mail.EmailNotificacaoService;
import br.com.catec.security.SenhaProvisoriaGenerator;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AdminUsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UsuarioPerfilRepository usuarioPerfilRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SenhaProvisoriaGenerator senhaProvisoriaGenerator;

    @Mock
    private EmailNotificacaoService emailNotificacaoService;

    @InjectMocks
    private AdminUsuarioService service;

    @Test
    void atualizar_proprioUsuario_naoPodeDesativar() {
        var u = usuarioAtivoAdmin(1L);
        when(usuarioRepository.findById(1L)).thenReturn(java.util.Optional.of(u));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("a@catec.local", 1L)).thenReturn(false);

        var req = new UsuarioUpdateRequest("A", "a@catec.local", null, false, List.of(PerfilMacro.ADMINISTRATIVO));

        var ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(1L, req, 1L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(usuarioPerfilRepository, never()).deleteByUsuarioId(anyLong());
    }

    @Test
    void atualizar_naoPodeAtivarComTrocaSenhaPendente() {
        var u = usuarioAtivoAdmin(2L);
        u.setAtivo(false);
        u.setRequerTrocaSenha(true);
        when(usuarioRepository.findById(2L)).thenReturn(java.util.Optional.of(u));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("a@catec.local", 2L)).thenReturn(false);

        var req = new UsuarioUpdateRequest("A", "a@catec.local", null, true, List.of(PerfilMacro.ADMINISTRATIVO));

        var ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(2L, req, 99L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void atualizar_proprioUsuario_naoPodeRemoverAdministrativo() {
        var u = usuarioAtivoAdmin(1L);
        when(usuarioRepository.findById(1L)).thenReturn(java.util.Optional.of(u));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("a@catec.local", 1L)).thenReturn(false);

        var req = new UsuarioUpdateRequest("A", "a@catec.local", null, true, List.of(PerfilMacro.COLABORADOR));

        var ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(1L, req, 1L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    private static Usuario usuarioAtivoAdmin(long id) {
        var u = new Usuario();
        ReflectionTestUtils.setField(u, "id", id);
        u.setNome("Admin");
        u.setEmail("a@catec.local");
        u.setSenhaHash("hash");
        u.setAtivo(true);
        u.setCriadoEm(Instant.now());
        u.setAtualizadoEm(Instant.now());
        var perfis = new ArrayList<UsuarioPerfil>();
        perfis.add(UsuarioPerfil.associar(u, PerfilMacro.ADMINISTRATIVO));
        u.setPerfis(perfis);
        return u;
    }
}
