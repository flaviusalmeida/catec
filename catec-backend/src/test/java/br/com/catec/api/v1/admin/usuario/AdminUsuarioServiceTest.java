package br.com.catec.api.v1.admin.usuario;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

import br.com.catec.domain.usuario.PerfilMacro;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioPerfil;
import br.com.catec.domain.usuario.UsuarioPerfilRepository;
import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.mail.EmailNotificacaoService;
import br.com.catec.security.SenhaProvisoriaGenerator;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
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

    private Usuario admin;

    @BeforeEach
    void setUp() {
        admin = usuario(1L, "Administrador", "admin@catec.local", true, false, PerfilMacro.ADMINISTRATIVO);
    }

    @Test
    void listar_deveRetornarUsuariosMapeados() {
        var colaborador = usuario(2L, "Colaborador", "colab@catec.local", true, false, PerfilMacro.COLABORADOR);
        when(usuarioRepository.findAll(any(org.springframework.data.domain.Sort.class)))
                .thenReturn(List.of(admin, colaborador));

        var result = service.listar();

        assertEquals(2, result.size());
        assertEquals("Administrador", result.get(0).nome());
        assertEquals(List.of("ADMINISTRATIVO"), result.get(0).perfis());
        assertEquals("Colaborador", result.get(1).nome());
    }

    @Test
    void obter_quandoUsuarioNaoExiste_deveLancarNotFound() {
        when(usuarioRepository.findById(99L)).thenReturn(java.util.Optional.empty());

        var ex = assertThrows(ResponseStatusException.class, () -> service.obter(99L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void criar_comDadosValidos_deveSalvarInativoComTrocaSenhaPendente() {
        when(usuarioRepository.existsByEmailIgnoreCase("novo@catec.local")).thenReturn(false);
        when(senhaProvisoriaGenerator.gerar()).thenReturn("Senha@Provisoria123");
        when(passwordEncoder.encode("Senha@Provisoria123")).thenReturn("hash-gerado");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 10L);
            return saved;
        });
        var persisted = usuario(10L, "Novo Usuário", "novo@catec.local", false, true, PerfilMacro.COLABORADOR);
        when(usuarioRepository.findById(10L)).thenReturn(java.util.Optional.of(persisted));

        var req =
                new UsuarioCreateRequest(" Novo Usuário ", " NOVO@catec.local ", " 11999990000 ", List.of(PerfilMacro.COLABORADOR));
        var response = service.criar(req);

        assertEquals("novo@catec.local", response.email());
        assertFalse(response.ativo());
        assertTrue(response.requerTrocaSenha());
        verify(usuarioPerfilRepository).deleteByUsuarioId(10L);
        verify(usuarioPerfilRepository).save(any(UsuarioPerfil.class));
        verify(emailNotificacaoService).enviarSenhaProvisoria("novo@catec.local", "Novo Usuário", "Senha@Provisoria123");
    }

    @Test
    void criar_comEmailJaExistente_deveLancarConflict() {
        when(usuarioRepository.existsByEmailIgnoreCase("duplicado@catec.local")).thenReturn(true);

        var req = new UsuarioCreateRequest("Duplicado", "duplicado@catec.local", null, List.of(PerfilMacro.COLABORADOR));
        var ex = assertThrows(ResponseStatusException.class, () -> service.criar(req));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(usuarioRepository, never()).save(any(Usuario.class));
        verify(emailNotificacaoService, never()).enviarSenhaProvisoria(any(), any(), any());
    }

    @Test
    void criar_comPerfisDuplicados_deveLancarBadRequest() {
        when(usuarioRepository.existsByEmailIgnoreCase("dup-perfil@catec.local")).thenReturn(false);

        var req = new UsuarioCreateRequest(
                "Duplicado Perfil",
                "dup-perfil@catec.local",
                null,
                Arrays.asList(PerfilMacro.COLABORADOR, PerfilMacro.COLABORADOR));
        var ex = assertThrows(ResponseStatusException.class, () -> service.criar(req));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void criar_quandoSalvarFalhaPorIntegridade_deveLancarConflict() {
        when(usuarioRepository.existsByEmailIgnoreCase("erro@catec.local")).thenReturn(false);
        when(senhaProvisoriaGenerator.gerar()).thenReturn("Senha@Provisoria123");
        when(passwordEncoder.encode("Senha@Provisoria123")).thenReturn("hash");
        when(usuarioRepository.save(any(Usuario.class))).thenThrow(new DataIntegrityViolationException("unique"));

        var req = new UsuarioCreateRequest("Erro", "erro@catec.local", null, List.of(PerfilMacro.COLABORADOR));
        var ex = assertThrows(ResponseStatusException.class, () -> service.criar(req));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void atualizar_proprioUsuario_naoPodeDesativar() {
        when(usuarioRepository.findById(1L)).thenReturn(java.util.Optional.of(admin));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("a@catec.local", 1L)).thenReturn(false);

        var req = new UsuarioUpdateRequest("A", "a@catec.local", null, false, List.of(PerfilMacro.ADMINISTRATIVO));

        var ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(1L, req, 1L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(usuarioPerfilRepository, never()).deleteByUsuarioId(anyLong());
    }

    @Test
    void atualizar_naoPodeAtivarComTrocaSenhaPendente() {
        var u = usuario(2L, "A", "a@catec.local", true, false, PerfilMacro.ADMINISTRATIVO);
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
        when(usuarioRepository.findById(1L)).thenReturn(java.util.Optional.of(admin));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("a@catec.local", 1L)).thenReturn(false);

        var req = new UsuarioUpdateRequest("A", "a@catec.local", null, true, List.of(PerfilMacro.COLABORADOR));

        var ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(1L, req, 1L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void atualizar_quandoNaoEncontrado_deveLancarNotFound() {
        when(usuarioRepository.findById(42L)).thenReturn(java.util.Optional.empty());

        var req = new UsuarioUpdateRequest("A", "a@catec.local", null, true, List.of(PerfilMacro.COLABORADOR));
        var ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(42L, req, 99L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void atualizar_comPerfisDuplicados_deveLancarBadRequest() {
        when(usuarioRepository.findById(1L)).thenReturn(java.util.Optional.of(admin));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("admin@catec.local", 1L)).thenReturn(false);

        var req = new UsuarioUpdateRequest(
                "Administrador",
                "admin@catec.local",
                null,
                true,
                Arrays.asList(PerfilMacro.ADMINISTRATIVO, PerfilMacro.ADMINISTRATIVO));
        var ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(1L, req, 99L));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void atualizar_comSucesso_deveAplicarCamposEPerfis() {
        var atual = usuario(5L, "Nome Antigo", "antigo@catec.local", true, false, PerfilMacro.COLABORADOR);
        var atualizado = usuario(5L, "Nome Novo", "novo@catec.local", true, false, PerfilMacro.ADMINISTRATIVO, PerfilMacro.FINANCEIRO);
        atualizado.setTelefone("11911112222");
        when(usuarioRepository.findById(5L)).thenReturn(java.util.Optional.of(atual), java.util.Optional.of(atualizado));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("novo@catec.local", 5L)).thenReturn(false);

        var req = new UsuarioUpdateRequest(
                " Nome Novo ",
                " NOVO@catec.local ",
                " 11911112222 ",
                true,
                List.of(PerfilMacro.ADMINISTRATIVO, PerfilMacro.FINANCEIRO));
        var response = service.atualizar(5L, req, 99L);

        assertEquals("Nome Novo", response.nome());
        assertEquals("novo@catec.local", response.email());
        assertEquals(List.of("ADMINISTRATIVO", "FINANCEIRO"), response.perfis());
        verify(usuarioPerfilRepository).deleteByUsuarioId(5L);
    }

    @Test
    void atualizar_quandoEmailConflita_deveLancarConflict() {
        when(usuarioRepository.findById(1L)).thenReturn(java.util.Optional.of(admin));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("conflito@catec.local", 1L)).thenReturn(true);

        var req = new UsuarioUpdateRequest("A", "conflito@catec.local", null, true, List.of(PerfilMacro.ADMINISTRATIVO));
        var ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(1L, req, 99L));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void atualizar_quandoSaveLancaIntegridade_deveLancarConflict() {
        when(usuarioRepository.findById(1L)).thenReturn(java.util.Optional.of(admin));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("admin@catec.local", 1L)).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenThrow(new DataIntegrityViolationException("unique"));

        var req = new UsuarioUpdateRequest("A", "admin@catec.local", null, true, List.of(PerfilMacro.ADMINISTRATIVO));
        var ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(1L, req, 99L));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void resetarSenhaProvisoria_quandoNaoEncontrado_deveLancarNotFound() {
        when(usuarioRepository.findById(99L)).thenReturn(java.util.Optional.empty());

        var ex = assertThrows(ResponseStatusException.class, () -> service.resetarSenhaProvisoria(99L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void resetarSenhaProvisoria_comSucesso_deveDesativarEEnviarEmail() {
        var u = usuario(4L, "Fulano", "fulano@catec.local", true, false, PerfilMacro.COLABORADOR);
        when(usuarioRepository.findById(4L)).thenReturn(java.util.Optional.of(u));
        when(senhaProvisoriaGenerator.gerar()).thenReturn("Nova@Senha123");
        when(passwordEncoder.encode("Nova@Senha123")).thenReturn("hash-nova");

        service.resetarSenhaProvisoria(4L);

        assertFalse(u.isAtivo());
        assertTrue(u.isRequerTrocaSenha());
        verify(usuarioRepository).save(u);
        verify(emailNotificacaoService).enviarSenhaProvisoria("fulano@catec.local", "Fulano", "Nova@Senha123");
    }

    private static Usuario usuario(
            long id, String nome, String email, boolean ativo, boolean requerTrocaSenha, PerfilMacro... perfisMacro) {
        var u = new Usuario();
        ReflectionTestUtils.setField(u, "id", id);
        u.setNome(nome);
        u.setEmail(email);
        u.setSenhaHash("hash");
        u.setTelefone(null);
        u.setAtivo(ativo);
        u.setRequerTrocaSenha(requerTrocaSenha);
        u.setCriadoEm(Instant.now());
        u.setAtualizadoEm(Instant.now());
        var perfis = new ArrayList<UsuarioPerfil>();
        for (PerfilMacro macro : perfisMacro) {
            perfis.add(UsuarioPerfil.associar(u, macro));
        }
        u.setPerfis(perfis);
        return u;
    }
}
