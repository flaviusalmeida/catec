package br.com.catec.security;

import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioPerfil;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public record UsuarioAutenticado(
        Long id, String email, String nome, boolean requerTrocaSenha, List<GrantedAuthority> authorities)
        implements UserDetails {

    public static UsuarioAutenticado from(Usuario usuario) {
        List<GrantedAuthority> auths = usuario.getPerfis().stream()
                .map(UsuarioPerfil::getPerfil)
                .<GrantedAuthority>map(p -> new SimpleGrantedAuthority("ROLE_" + p))
                .toList();
        return new UsuarioAutenticado(
                usuario.getId(), usuario.getEmail(), usuario.getNome(), usuario.isRequerTrocaSenha(), auths);
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
}
