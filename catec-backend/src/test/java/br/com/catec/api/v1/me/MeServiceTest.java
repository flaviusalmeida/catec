package br.com.catec.api.v1.me;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import br.com.catec.domain.acesso.PermissaoResolver;
import br.com.catec.domain.acesso.UsuarioGrupo;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class MeServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PermissaoResolver permissaoResolver;

    @InjectMocks
    private MeService service;

    @Test
    void obterPerfil_quandoUsuarioExiste_deveRetornarGruposEPermissoes() {
        var usuario = usuario(7L, "Usuário Teste", "user@catec.local", "SOCIO", "ADMINISTRATIVO");
        when(usuarioRepository.findById(7L)).thenReturn(java.util.Optional.of(usuario));
        when(permissaoResolver.resolve(usuario.getGrupos()))
                .thenReturn(new PermissaoResolver.ResolvedAccess(
                        List.of("ADMINISTRATIVO", "SOCIO"), List.of("tela.painel", "acao.grupo.gerir")));

        var response = service.obterPerfil(7L);

        assertEquals(7L, response.id());
        assertEquals("Usuário Teste", response.nome());
        assertEquals("user@catec.local", response.email());
        assertEquals(List.of("ADMINISTRATIVO", "SOCIO"), response.grupos());
        assertEquals(List.of("tela.painel", "acao.grupo.gerir"), response.permissoes());
    }

    @Test
    void obterPerfil_quandoNaoExiste_deveLancarNotFound() {
        when(usuarioRepository.findById(99L)).thenReturn(java.util.Optional.empty());
        var ex = assertThrows(ResponseStatusException.class, () -> service.obterPerfil(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    private static Usuario usuario(long id, String nome, String email, String... codigosGrupo) {
        var u = new Usuario();
        ReflectionTestUtils.setField(u, "id", id);
        u.setNome(nome);
        u.setEmail(email);
        u.setSenhaHash("hash");
        u.setAtivo(true);
        u.setRequerTrocaSenha(false);
        u.setCriadoEm(Instant.now());
        u.setAtualizadoEm(Instant.now());
        var grupos = new ArrayList<UsuarioGrupo>();
        u.setGrupos(grupos);
        return u;
    }
}
