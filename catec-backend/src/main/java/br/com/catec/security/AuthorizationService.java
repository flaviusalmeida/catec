package br.com.catec.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service("authz")
public class AuthorizationService {

    public boolean has(String codigoPermissao) {
        return principalAtual().hasPermissao(codigoPermissao);
    }

    public boolean hasAny(String... codigosPermissao) {
        UsuarioAutenticado principal = principalAtual();
        for (String codigo : codigosPermissao) {
            if (principal.hasPermissao(codigo)) {
                return true;
            }
        }
        return false;
    }

    public void require(String codigoPermissao) {
        require(principalAtual(), codigoPermissao);
    }

    public boolean has(UsuarioAutenticado principal, String codigoPermissao) {
        return principal.hasPermissao(codigoPermissao);
    }

    public void require(UsuarioAutenticado principal, String codigoPermissao) {
        if (!has(principal, codigoPermissao)) {
            throw forbidden(codigoPermissao);
        }
    }

    public boolean podeListarTodosProjetos(UsuarioAutenticado principal) {
        return principal.hasPermissao(PermissaoCodigo.ACAO_PROJETO_LISTAR_TODOS);
    }

    /** Leitura ampla (ADM/sócio) ou projeto criado pelo usuário com acesso ao detalhe. */
    public boolean podeLerProjeto(UsuarioAutenticado principal, Long criadoPorId) {
        if (podeListarTodosProjetos(principal)) {
            return true;
        }
        return principal.id().equals(criadoPorId)
                && principal.hasPermissao(PermissaoCodigo.TELA_PROJETO_DETALHE);
    }

    /** Operações exclusivas do perfil administrativo (gestão de cadastros e fluxo). */
    public boolean podeGerirFluxoAdministrativo(UsuarioAutenticado principal) {
        return principal.hasPermissao(PermissaoCodigo.ACAO_CLIENTE_CRIAR);
    }

    public boolean podeAprovarComoSocio(UsuarioAutenticado principal) {
        return principal.hasPermissao(PermissaoCodigo.ACAO_SOCIO_PROPOSTA_APROVAR);
    }

    public boolean podeTrabalharComoColaborador(UsuarioAutenticado principal) {
        return principal.hasPermissao(PermissaoCodigo.ACAO_PROJETO_CRIAR);
    }

    public UsuarioAutenticado principalAtual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UsuarioAutenticado principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida.");
        }
        return principal;
    }

    private static ResponseStatusException forbidden(String codigoPermissao) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, "Permissão insuficiente: " + codigoPermissao);
    }
}
