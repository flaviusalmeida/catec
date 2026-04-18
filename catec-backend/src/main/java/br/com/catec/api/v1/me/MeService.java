package br.com.catec.api.v1.me;

import br.com.catec.domain.usuario.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MeService {

    private final UsuarioRepository usuarioRepository;

    public MeService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public MeResponse obterPerfil(Long usuarioId) {
        var usuario = usuarioRepository
                .findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        var perfis = usuario.getPerfis().stream().map(p -> p.getPerfil()).sorted().toList();
        return new MeResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                perfis,
                usuario.isAtivo(),
                usuario.getTelefone(),
                usuario.isRequerTrocaSenha());
    }
}
