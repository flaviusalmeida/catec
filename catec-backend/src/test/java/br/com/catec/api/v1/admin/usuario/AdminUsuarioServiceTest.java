package br.com.catec.api.v1.admin.usuario;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

import br.com.catec.domain.acesso.GrupoAcesso;
import br.com.catec.domain.acesso.GrupoAcessoRepository;
import br.com.catec.domain.acesso.UsuarioGrupo;
import br.com.catec.domain.acesso.UsuarioGrupoRepository;
import br.com.catec.domain.usuario.Usuario;
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
    private GrupoAcessoRepository grupoAcessoRepository;

    @Mock
    private UsuarioGrupoRepository usuarioGrupoRepository;

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
        admin = usuario(1L, "Administrador", "admin@catec.local", true, false, "ADMINISTRATIVO");
        for (String codigo :
                List.of("COLABORADOR", "ADMINISTRATIVO", "SOCIO", "SALA_TECNICA", "CAMPO", "FINANCEIRO")) {
            lenient()
                    .when(grupoAcessoRepository.findByCodigo(codigo))
                    .thenReturn(java.util.Optional.of(grupo(codigo)));
        }
    }

    @Test
    void listar_deveRetornarUsuariosMapeados() {
        var colaborador = usuario(2L, "Colaborador", "colab@catec.local", true, false, "COLABORADOR");
        when(usuarioRepository.findAll(any(org.springframework.data.domain.Sort.class)))
                .thenReturn(List.of(admin, colaborador));

        var result = service.listar();

        assertEquals(2, result.size());
        assertEquals("Administrador", result.get(0).nome());
        assertEquals(List.of("ADMINISTRATIVO"), result.get(0).grupos());
        assertEquals("Colaborador", result.get(1).nome());
    }

    @Test
    void listar_comJoinDePermissoes_naoDuplicaGruposNaResposta() {
        var adminComJoinInflado = usuario(1L, "Administrador", "admin@catec.local", true, false, "ADMINISTRATIVO");
        // Simula efeito do fetch join com grupo_permissao (mesmo vínculo repetido N vezes).
        var inflado = new ArrayList<>(adminComJoinInflado.getGrupos());
        for (int i = 0; i < 5; i++) {
            inflado.add(UsuarioGrupo.associar(adminComJoinInflado, grupo("ADMINISTRATIVO")));
        }
        adminComJoinInflado.setGrupos(inflado);

        when(usuarioRepository.findAll(any(org.springframework.data.domain.Sort.class)))
                .thenReturn(List.of(adminComJoinInflado));

        var result = service.listar();

        assertEquals(List.of("ADMINISTRATIVO"), result.get(0).grupos());
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
        var persisted = usuario(10L, "Novo Usuário", "novo@catec.local", false, true, "COLABORADOR");
        when(usuarioRepository.findById(10L)).thenReturn(java.util.Optional.of(persisted));

        var req = new UsuarioCreateRequest(" Novo Usuário ", " NOVO@catec.local ", " 11999990000 ", List.of("COLABORADOR"));
        var response = service.criar(req);

        assertEquals("novo@catec.local", response.email());
        assertFalse(response.ativo());
        assertTrue(response.requerTrocaSenha());
        verify(usuarioGrupoRepository).deleteByUsuarioId(10L);
        verify(usuarioGrupoRepository).save(any(UsuarioGrupo.class));
        verify(emailNotificacaoService).enviarSenhaProvisoria("novo@catec.local", "Novo Usuário", "Senha@Provisoria123");
    }

    @Test
    void criar_comEmailJaExistente_deveLancarConflict() {
        when(usuarioRepository.existsByEmailIgnoreCase("duplicado@catec.local")).thenReturn(true);

        var req = new UsuarioCreateRequest("Duplicado", "duplicado@catec.local", null, List.of("COLABORADOR"));
        var ex = assertThrows(ResponseStatusException.class, () -> service.criar(req));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(usuarioRepository, never()).save(any(Usuario.class));
        verify(emailNotificacaoService, never()).enviarSenhaProvisoria(any(), any(), any());
    }

    @Test
    void criar_comGruposDuplicados_deveLancarBadRequest() {
        when(usuarioRepository.existsByEmailIgnoreCase("dup-grupo@catec.local")).thenReturn(false);

        var req = new UsuarioCreateRequest(
                "Duplicado Grupo", "dup-grupo@catec.local", null, Arrays.asList("COLABORADOR", "COLABORADOR"));
        var ex = assertThrows(ResponseStatusException.class, () -> service.criar(req));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void criar_quandoSalvarFalhaPorIntegridade_deveLancarConflict() {
        when(usuarioRepository.existsByEmailIgnoreCase("erro@catec.local")).thenReturn(false);
        when(senhaProvisoriaGenerator.gerar()).thenReturn("Senha@Provisoria123");
        when(passwordEncoder.encode("Senha@Provisoria123")).thenReturn("hash");
        when(usuarioRepository.save(any(Usuario.class))).thenThrow(new DataIntegrityViolationException("unique"));

        var req = new UsuarioCreateRequest("Erro", "erro@catec.local", null, List.of("COLABORADOR"));
        var ex = assertThrows(ResponseStatusException.class, () -> service.criar(req));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void atualizar_proprioUsuario_naoPodeDesativar() {
        when(usuarioRepository.findById(1L)).thenReturn(java.util.Optional.of(admin));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("a@catec.local", 1L)).thenReturn(false);

        var req = new UsuarioUpdateRequest("A", "a@catec.local", null, false, List.of("ADMINISTRATIVO"));

        var ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(1L, req, 1L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(usuarioGrupoRepository, never()).deleteByUsuarioId(anyLong());
    }

    @Test
    void atualizar_naoPodeAtivarComTrocaSenhaPendente() {
        var u = usuario(2L, "A", "a@catec.local", true, false, "ADMINISTRATIVO");
        u.setAtivo(false);
        u.setRequerTrocaSenha(true);
        when(usuarioRepository.findById(2L)).thenReturn(java.util.Optional.of(u));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("a@catec.local", 2L)).thenReturn(false);

        var req = new UsuarioUpdateRequest("A", "a@catec.local", null, true, List.of("ADMINISTRATIVO"));

        var ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(2L, req, 99L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void atualizar_proprioUsuario_naoPodeRemoverAdministrativo() {
        when(usuarioRepository.findById(1L)).thenReturn(java.util.Optional.of(admin));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("a@catec.local", 1L)).thenReturn(false);

        var req = new UsuarioUpdateRequest("A", "a@catec.local", null, true, List.of("COLABORADOR"));

        var ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(1L, req, 1L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void atualizar_quandoNaoEncontrado_deveLancarNotFound() {
        when(usuarioRepository.findById(42L)).thenReturn(java.util.Optional.empty());

        var req = new UsuarioUpdateRequest("A", "a@catec.local", null, true, List.of("COLABORADOR"));
        var ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(42L, req, 99L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void atualizar_comGruposDuplicados_deveLancarBadRequest() {
        when(usuarioRepository.findById(1L)).thenReturn(java.util.Optional.of(admin));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("admin@catec.local", 1L)).thenReturn(false);

        var req = new UsuarioUpdateRequest(
                "Administrador",
                "admin@catec.local",
                null,
                true,
                Arrays.asList("ADMINISTRATIVO", "ADMINISTRATIVO"));
        var ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(1L, req, 99L));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void atualizar_comSucesso_deveAplicarCamposEGrupos() {
        var atual = usuario(5L, "Nome Antigo", "antigo@catec.local", true, false, "COLABORADOR");
        var atualizado = usuario(5L, "Nome Novo", "novo@catec.local", true, false, "ADMINISTRATIVO", "FINANCEIRO");
        atualizado.setTelefone("11911112222");
        when(usuarioRepository.findById(5L)).thenReturn(java.util.Optional.of(atual), java.util.Optional.of(atualizado));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("novo@catec.local", 5L)).thenReturn(false);

        var req = new UsuarioUpdateRequest(
                " Nome Novo ", " NOVO@catec.local ", " 11911112222 ", true, List.of("ADMINISTRATIVO", "FINANCEIRO"));
        var response = service.atualizar(5L, req, 99L);

        assertEquals("Nome Novo", response.nome());
        assertEquals("novo@catec.local", response.email());
        assertEquals(List.of("ADMINISTRATIVO", "FINANCEIRO"), response.grupos());
        verify(usuarioGrupoRepository).deleteByUsuarioId(5L);
    }

    @Test
    void atualizar_quandoEmailConflita_deveLancarConflict() {
        when(usuarioRepository.findById(1L)).thenReturn(java.util.Optional.of(admin));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("conflito@catec.local", 1L)).thenReturn(true);

        var req = new UsuarioUpdateRequest("A", "conflito@catec.local", null, true, List.of("ADMINISTRATIVO"));
        var ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(1L, req, 99L));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void atualizar_quandoSaveLancaIntegridade_deveLancarConflict() {
        when(usuarioRepository.findById(1L)).thenReturn(java.util.Optional.of(admin));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("admin@catec.local", 1L)).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenThrow(new DataIntegrityViolationException("unique"));

        var req = new UsuarioUpdateRequest("A", "admin@catec.local", null, true, List.of("ADMINISTRATIVO"));
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
        var u = usuario(4L, "Fulano", "fulano@catec.local", true, false, "COLABORADOR");
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
            long id, String nome, String email, boolean ativo, boolean requerTrocaSenha, String... codigosGrupo) {
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
        var grupos = new ArrayList<UsuarioGrupo>();
        for (String codigo : codigosGrupo) {
            grupos.add(UsuarioGrupo.associar(u, grupo(codigo)));
        }
        u.setGrupos(grupos);
        return u;
    }

    private static GrupoAcesso grupo(String codigo) {
        var g = new GrupoAcesso();
        g.setCodigo(codigo);
        g.setNome(codigo);
        g.setAtivo(true);
        g.setSistema(true);
        g.setCriadoEm(Instant.now());
        g.setAtualizadoEm(Instant.now());
        return g;
    }
}
