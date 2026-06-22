package br.com.catec.api.v1.admin.grupo;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.catec.domain.acesso.GrupoAcesso;
import br.com.catec.domain.acesso.GrupoAcessoRepository;
import br.com.catec.domain.acesso.Permissao;
import br.com.catec.domain.acesso.PermissaoRepository;
import br.com.catec.domain.acesso.TipoPermissao;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AdminGrupoServiceTest {

    @Mock
    private GrupoAcessoRepository grupoAcessoRepository;

    @Mock
    private PermissaoRepository permissaoRepository;

    @InjectMocks
    private AdminGrupoService service;

    @Test
    void criar_devePersistirGrupoCustomizadoComPermissoes() {
        var permissao = permissao(1L, "tela.painel");
        when(grupoAcessoRepository.existsByCodigo("EQUIPE_COMERCIAL")).thenReturn(false);
        when(permissaoRepository.findByCodigoIn(List.of("tela.painel"))).thenReturn(List.of(permissao));
        when(grupoAcessoRepository.save(any(GrupoAcesso.class))).thenAnswer(inv -> {
            GrupoAcesso g = inv.getArgument(0);
            ReflectionTestUtils.setField(g, "id", 10L);
            return g;
        });
        when(grupoAcessoRepository.findById(10L)).thenAnswer(inv -> {
            GrupoAcesso g = new GrupoAcesso();
            ReflectionTestUtils.setField(g, "id", 10L);
            g.setCodigo("EQUIPE_COMERCIAL");
            g.setNome("Equipe Comercial");
            g.setDescricao("Grupo customizado");
            g.setAtivo(true);
            g.setSistema(false);
            g.setCriadoEm(Instant.now());
            g.setAtualizadoEm(Instant.now());
            g.setPermissoes(Set.of(permissao));
            return Optional.of(g);
        });

        var response = service.criar(new GrupoCreateRequest("Equipe Comercial", "Grupo customizado", List.of("tela.painel")));

        assertEquals("EQUIPE_COMERCIAL", response.codigo());
        assertEquals("Equipe Comercial", response.nome());
        assertFalse(response.sistema());
        assertEquals(List.of("tela.painel"), response.permissoes());
        verify(grupoAcessoRepository).save(any(GrupoAcesso.class));
    }

    @Test
    void excluir_quandoGrupoSistema_deveLancarBadRequest() {
        var grupo = grupoSistema(1L, "ADMINISTRATIVO");
        when(grupoAcessoRepository.findById(1L)).thenReturn(Optional.of(grupo));

        var ex = assertThrows(ResponseStatusException.class, () -> service.excluir(1L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    private static Permissao permissao(Long id, String codigo) {
        var p = new Permissao();
        ReflectionTestUtils.setField(p, "id", id);
        ReflectionTestUtils.setField(p, "codigo", codigo);
        ReflectionTestUtils.setField(p, "nome", codigo);
        ReflectionTestUtils.setField(p, "tipo", TipoPermissao.TELA);
        ReflectionTestUtils.setField(p, "modulo", "teste");
        return p;
    }

    private static GrupoAcesso grupoSistema(Long id, String codigo) {
        var g = new GrupoAcesso();
        ReflectionTestUtils.setField(g, "id", id);
        g.setCodigo(codigo);
        g.setNome(codigo);
        g.setSistema(true);
        g.setAtivo(true);
        g.setCriadoEm(Instant.now());
        g.setAtualizadoEm(Instant.now());
        return g;
    }
}
