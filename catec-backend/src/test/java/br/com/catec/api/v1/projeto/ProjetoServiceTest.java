package br.com.catec.api.v1.projeto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.catec.domain.cliente.Cliente;
import br.com.catec.domain.cliente.ClienteRepository;
import br.com.catec.domain.cliente.TipoPessoa;
import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.security.UsuarioAutenticado;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ProjetoServiceTest {

    @Mock
    private ProjetoRepository projetoRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ProjetoService service;

    @Test
    void atualizar_quandoAdminTransicaoInvalida_deve400() {
        Projeto p = projeto(1L, ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL, 10L, 1L);
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(p));

        var req = new ProjetoUpdateRequest(null, null, null, ProjetoStatus.PROPOSTA_ENVIADA_CLIENTE);

        ResponseStatusException ex =
                assertThrows(ResponseStatusException.class, () -> service.atualizar(1L, req, adminPrincipal()));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(projetoRepository, org.mockito.Mockito.never()).save(any());
    }

    @Test
    void atualizar_quandoAdminAguardandoPropostaParaElaborando_devePersistir() {
        Projeto p = projeto(1L, ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL, 10L, 1L);
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(p));
        when(projetoRepository.save(any(Projeto.class))).thenAnswer(inv -> inv.getArgument(0));

        var req = new ProjetoUpdateRequest(null, null, null, ProjetoStatus.ELABORANDO_PROPOSTA);

        ProjetoResponse out = service.atualizar(1L, req, adminPrincipal());

        assertEquals(ProjetoStatus.ELABORANDO_PROPOSTA, out.status());
        verify(projetoRepository).save(p);
    }

    @Test
    void atualizar_quandoColaboradorNaoDono_deve403() {
        Projeto p = projeto(1L, ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL, 99L, 1L);
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(p));

        var req = new ProjetoUpdateRequest(null, "Novo", "Esc", null);
        var colabOutro = colabPrincipal(2L);

        ResponseStatusException ex =
                assertThrows(ResponseStatusException.class, () -> service.atualizar(1L, req, colabOutro));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void listar_quandoColaborador_deveFiltrarPorCriador() {
        when(projetoRepository.findAllByCriadoPorId(eq(2L), any(Sort.class)))
                .thenReturn(List.of());

        service.listar(colabPrincipal(2L));

        verify(projetoRepository).findAllByCriadoPorId(eq(2L), any(Sort.class));
        verify(projetoRepository, org.mockito.Mockito.never()).findAll(any(Sort.class));
    }

    @Test
    void listar_quandoAdmin_deveListarTodos() {
        when(projetoRepository.findAll(any(Sort.class))).thenReturn(List.of());

        service.listar(adminPrincipal());

        verify(projetoRepository).findAll(any(Sort.class));
    }

    private static UsuarioAutenticado adminPrincipal() {
        return new UsuarioAutenticado(
                1L, "admin@catec.local", "Admin", false, List.of(new SimpleGrantedAuthority("ROLE_ADMINISTRATIVO")));
    }

    private static UsuarioAutenticado colabPrincipal(long id) {
        return new UsuarioAutenticado(
                id, "colab@catec.local", "Colab", false, List.of(new SimpleGrantedAuthority("ROLE_COLABORADOR")));
    }

    private static Projeto projeto(long id, ProjetoStatus status, long criadoPorId, long clienteId) {
        Cliente c = new Cliente();
        ReflectionTestUtils.setField(c, "id", clienteId);
        c.setTipoPessoa(TipoPessoa.PJ);
        c.setRazaoSocialOuNome("Cliente SA");
        c.setEmail("cliente@test.com");
        c.setTelefone("11988887777");
        c.setCriadoEm(Instant.now());
        c.setAtualizadoEm(Instant.now());

        Usuario u = new Usuario();
        ReflectionTestUtils.setField(u, "id", criadoPorId);
        u.setNome("Criador");
        u.setEmail("c@c.com");
        u.setSenhaHash("x");
        u.setAtivo(true);
        u.setRequerTrocaSenha(false);
        u.setCriadoEm(Instant.now());
        u.setAtualizadoEm(Instant.now());

        Projeto p = new Projeto();
        ReflectionTestUtils.setField(p, "id", id);
        p.setCliente(c);
        p.setCriadoPor(u);
        p.setTitulo("T");
        p.setEscopo("E");
        p.setEmailContato("a@b.com");
        p.setStatus(status);
        p.setCriadoEm(Instant.now());
        p.setAtualizadoEm(Instant.now());
        p.setClienteAssociadoEm(Instant.now());
        p.setClienteAssociadoPor(u);
        return p;
    }
}
