package br.com.catec.security;

import static org.junit.jupiter.api.Assertions.*;

import br.com.catec.security.PermissaoCodigo;
import br.com.catec.security.UsuarioAutenticadoFixtures;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

class AuthorizationServiceTest {

    private final AuthorizationService service = new AuthorizationService();

    @AfterEach
    void limparContexto() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void has_deveRetornarTrueQuandoPermissaoPresente() {
        autenticarComPermissoes("acao.grupo.gerir");
        assertTrue(service.has("acao.grupo.gerir"));
        assertFalse(service.has("acao.cliente.excluir"));
    }

    @Test
    void require_deveLancarForbiddenQuandoPermissaoAusente() {
        autenticarComPermissoes("tela.painel");
        assertThrows(Exception.class, () -> service.require("acao.grupo.gerir"));
    }

    @Test
    void podeLerProjeto_quandoListarTodos_devePermitir() {
        var principal = UsuarioAutenticadoFixtures.socio(1L);
        assertTrue(service.podeLerProjeto(principal, 99L));
    }

    @Test
    void podeLerProjeto_quandoCriadorComDetalhe_devePermitir() {
        var principal = UsuarioAutenticadoFixtures.colaborador(5L);
        assertTrue(service.podeLerProjeto(principal, 5L));
    }

    @Test
    void podeLerProjeto_quandoCriadorDiferente_deveNegar() {
        var principal = UsuarioAutenticadoFixtures.colaborador(5L);
        assertFalse(service.podeLerProjeto(principal, 99L));
    }

    @Test
    void hasAny_deveRetornarTrueQuandoUmaPermissaoPresente() {
        autenticarComPermissoes(PermissaoCodigo.TELA_PAINEL);
        assertTrue(service.hasAny(PermissaoCodigo.TELA_PAINEL, PermissaoCodigo.ACAO_GRUPO_GERIR));
    }

    private static void autenticarComPermissoes(String... permissoes) {
        var authorities = List.of(permissoes).stream()
                .map(SimpleGrantedAuthority::new)
                .map(a -> (org.springframework.security.core.GrantedAuthority) a)
                .toList();
        var principal = UsuarioAutenticado.comAutoridades(
                1L, "admin@catec.local", "Admin", false, authorities);
        var authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
