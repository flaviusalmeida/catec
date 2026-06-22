package br.com.catec.security;

import br.com.catec.domain.acesso.PermissaoResolver;
import br.com.catec.domain.usuario.Usuario;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public record UsuarioAutenticado(
        Long id,
        String email,
        String nome,
        boolean requerTrocaSenha,
        List<String> grupos,
        List<String> permissoes,
        List<GrantedAuthority> authorities)
        implements UserDetails {

    public static UsuarioAutenticado from(Usuario usuario, PermissaoResolver permissaoResolver) {
        var resolved = permissaoResolver.resolve(usuario.getGrupos());
        Set<GrantedAuthority> auths = new LinkedHashSet<>();
        for (String grupo : resolved.grupos()) {
            auths.add(new SimpleGrantedAuthority("ROLE_" + grupo));
        }
        for (String permissao : resolved.permissoes()) {
            auths.add(new SimpleGrantedAuthority(permissao));
        }
        return new UsuarioAutenticado(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getNome(),
                usuario.isRequerTrocaSenha(),
                resolved.grupos(),
                resolved.permissoes(),
                List.copyOf(auths));
    }

    public static UsuarioAutenticado comAutoridades(
            Long id,
            String email,
            String nome,
            boolean requerTrocaSenha,
            List<GrantedAuthority> authorities) {
        List<String> grupos = new ArrayList<>();
        List<String> permissoes = new ArrayList<>();
        for (GrantedAuthority authority : authorities) {
            String value = authority.getAuthority();
            if (value.startsWith("ROLE_")) {
                grupos.add(value.substring("ROLE_".length()));
            } else {
                permissoes.add(value);
            }
        }
        return new UsuarioAutenticado(
                id,
                email,
                nome,
                requerTrocaSenha,
                List.copyOf(grupos),
                List.copyOf(permissoes),
                List.copyOf(authorities));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public boolean hasPermissao(String codigo) {
        return permissoes.contains(codigo);
    }

    public boolean hasGrupo(String codigo) {
        return grupos.contains(codigo);
    }
}
