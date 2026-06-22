package br.com.catec.security;

import java.util.ArrayList;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

/** Principais de teste com permissões do seed V27. */
public final class UsuarioAutenticadoFixtures {

    private UsuarioAutenticadoFixtures() {}

    public static UsuarioAutenticado administrativo(Long id) {
        return UsuarioAutenticado.comAutoridades(
                id, "admin@catec.local", "Administrador", false, autoridadesAdministrativo());
    }

    public static UsuarioAutenticado colaborador(Long id) {
        return UsuarioAutenticado.comAutoridades(id, "colab@catec.local", "Colaborador", false, autoridadesColaborador());
    }

    public static UsuarioAutenticado socio(Long id) {
        return UsuarioAutenticado.comAutoridades(id, "socio@catec.local", "Sócio", false, autoridadesSocio());
    }

    public static UsuarioAutenticado semPermissoes(Long id) {
        return UsuarioAutenticado.comAutoridades(id, "x@local", "X", false, List.of());
    }

    private static List<GrantedAuthority> autoridadesAdministrativo() {
        List<GrantedAuthority> auths = new ArrayList<>();
        auths.add(role("ADMINISTRATIVO"));
        auths.add(perm(PermissaoCodigo.TELA_PAINEL));
        auths.add(perm(PermissaoCodigo.TELA_PROJETOS));
        auths.add(perm(PermissaoCodigo.TELA_PROJETO_DETALHE));
        auths.add(perm(PermissaoCodigo.TELA_CLIENTES));
        auths.add(perm(PermissaoCodigo.TELA_USUARIOS));
        auths.add(perm(PermissaoCodigo.TELA_SOCIO_PROPOSTAS));
        auths.add(perm(PermissaoCodigo.TELA_GRUPOS));
        auths.add(perm(PermissaoCodigo.ACAO_PROJETO_CRIAR));
        auths.add(perm(PermissaoCodigo.ACAO_PROJETO_EDITAR));
        auths.add(perm(PermissaoCodigo.ACAO_PROJETO_ASSOCIAR_CLIENTE));
        auths.add(perm(PermissaoCodigo.ACAO_PROJETO_LISTAR_TODOS));
        auths.add(perm(PermissaoCodigo.ACAO_CLIENTE_CRIAR));
        auths.add(perm(PermissaoCodigo.ACAO_CLIENTE_EDITAR));
        auths.add(perm(PermissaoCodigo.ACAO_CLIENTE_EXCLUIR));
        auths.add(perm(PermissaoCodigo.ACAO_USUARIO_GERIR));
        auths.add(perm(PermissaoCodigo.ACAO_USUARIO_REDEFINIR_SENHA));
        auths.add(perm(PermissaoCodigo.ACAO_PROPOSTA_CRIAR));
        auths.add(perm(PermissaoCodigo.ACAO_PROPOSTA_EDITAR));
        auths.add(perm(PermissaoCodigo.ACAO_PROPOSTA_ENVIAR_CLIENTE));
        auths.add(perm(PermissaoCodigo.ACAO_PROPOSTA_APROVAR_INTERNO));
        auths.add(perm(PermissaoCodigo.ACAO_SOCIO_PROPOSTA_APROVAR));
        auths.add(perm(PermissaoCodigo.ACAO_SOCIO_PROPOSTA_DEVOLVER));
        auths.add(perm(PermissaoCodigo.ACAO_CONTRATO_CRIAR));
        auths.add(perm(PermissaoCodigo.ACAO_CONTRATO_ENVIAR));
        auths.add(perm(PermissaoCodigo.ACAO_DOCUMENTO_UPLOAD));
        auths.add(perm(PermissaoCodigo.ACAO_INTERACAO_REGISTRAR));
        auths.add(perm(PermissaoCodigo.ACAO_GRUPO_GERIR));
        return List.copyOf(auths);
    }

    private static List<GrantedAuthority> autoridadesColaborador() {
        return List.of(
                role("COLABORADOR"),
                perm(PermissaoCodigo.TELA_PAINEL),
                perm(PermissaoCodigo.TELA_PROJETOS),
                perm(PermissaoCodigo.TELA_PROJETO_DETALHE),
                perm(PermissaoCodigo.ACAO_PROJETO_CRIAR),
                perm(PermissaoCodigo.ACAO_PROJETO_EDITAR),
                perm(PermissaoCodigo.ACAO_PROJETO_ASSOCIAR_CLIENTE));
    }

    private static List<GrantedAuthority> autoridadesSocio() {
        return List.of(
                role("SOCIO"),
                perm(PermissaoCodigo.TELA_PAINEL),
                perm(PermissaoCodigo.TELA_PROJETO_DETALHE),
                perm(PermissaoCodigo.TELA_SOCIO_PROPOSTAS),
                perm(PermissaoCodigo.ACAO_PROJETO_LISTAR_TODOS),
                perm(PermissaoCodigo.ACAO_SOCIO_PROPOSTA_APROVAR),
                perm(PermissaoCodigo.ACAO_SOCIO_PROPOSTA_DEVOLVER));
    }

    private static SimpleGrantedAuthority role(String grupo) {
        return new SimpleGrantedAuthority("ROLE_" + grupo);
    }

    private static SimpleGrantedAuthority perm(String codigo) {
        return new SimpleGrantedAuthority(codigo);
    }
}
