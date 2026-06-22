package br.com.catec.api.v1.me;

import br.com.catec.domain.acesso.PermissaoResolver;
import br.com.catec.domain.usuario.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MeService {

    private final UsuarioRepository usuarioRepository;
    private final PermissaoResolver permissaoResolver;

    public MeService(UsuarioRepository usuarioRepository, PermissaoResolver permissaoResolver) {
        this.usuarioRepository = usuarioRepository;
        this.permissaoResolver = permissaoResolver;
    }

    @Transactional(readOnly = true)
    public MeResponse obterPerfil(Long usuarioId) {
        var usuario = usuarioRepository
                .findByIdComPermissoes(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        var access = permissaoResolver.resolve(usuario.getGrupos());
        return new MeResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                access.grupos(),
                access.permissoes(),
                usuario.isAtivo(),
                usuario.getTelefone(),
                usuario.isRequerTrocaSenha());
    }
}
