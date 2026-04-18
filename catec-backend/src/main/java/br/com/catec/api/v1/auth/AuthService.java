package br.com.catec.api.v1.auth;

import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.security.JwtService;
import br.com.catec.security.PoliticaSenha;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(String email, String password) {
        var usuario = usuarioRepository
                .findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas."));
        if (!passwordEncoder.matches(password, usuario.getSenhaHash())) {
            throw new BadCredentialsException("Credenciais inválidas.");
        }
        if (!usuario.isAtivo() && !usuario.isRequerTrocaSenha()) {
            throw new BadCredentialsException("Credenciais inválidas.");
        }
        boolean troca = usuario.isRequerTrocaSenha();
        return new LoginResponse(
                "Bearer", jwtService.generateToken(usuario), jwtService.getExpirationSeconds(), troca);
    }

    @Transactional
    public LoginResponse definirNovaSenha(Long usuarioId, String senhaNova) {
        try {
            PoliticaSenha.validarSenhaDefinitiva(senhaNova);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
        var usuario = usuarioRepository
                .findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        if (!usuario.isRequerTrocaSenha()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não há alteração de senha pendente.");
        }
        usuario.setSenhaHash(passwordEncoder.encode(senhaNova));
        usuario.setRequerTrocaSenha(false);
        usuario.setAtivo(true);
        usuarioRepository.save(usuario);
        var atualizado = usuarioRepository
                .findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        return new LoginResponse(
                "Bearer",
                jwtService.generateToken(atualizado),
                jwtService.getExpirationSeconds(),
                atualizado.isRequerTrocaSenha());
    }
}
