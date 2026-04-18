package br.com.catec.api.v1.admin.usuario;

import br.com.catec.domain.usuario.PerfilMacro;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioPerfil;
import br.com.catec.domain.usuario.UsuarioPerfilRepository;
import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.mail.EmailNotificacaoService;
import br.com.catec.security.SenhaProvisoriaGenerator;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminUsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioPerfilRepository usuarioPerfilRepository;
    private final PasswordEncoder passwordEncoder;
    private final SenhaProvisoriaGenerator senhaProvisoriaGenerator;
    private final EmailNotificacaoService emailNotificacaoService;

    public AdminUsuarioService(
            UsuarioRepository usuarioRepository,
            UsuarioPerfilRepository usuarioPerfilRepository,
            PasswordEncoder passwordEncoder,
            SenhaProvisoriaGenerator senhaProvisoriaGenerator,
            EmailNotificacaoService emailNotificacaoService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioPerfilRepository = usuarioPerfilRepository;
        this.passwordEncoder = passwordEncoder;
        this.senhaProvisoriaGenerator = senhaProvisoriaGenerator;
        this.emailNotificacaoService = emailNotificacaoService;
    }

    @Transactional(readOnly = true)
    public List<AdminUsuarioResponse> listar() {
        return usuarioRepository.findAll(Sort.by("nome").ascending()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminUsuarioResponse obter(Long id) {
        return usuarioRepository.findById(id).map(this::toResponse).orElseThrow(() -> notFound());
    }

    @Transactional
    public AdminUsuarioResponse criar(UsuarioCreateRequest req) {
        if (usuarioRepository.existsByEmailIgnoreCase(req.email().trim().toLowerCase())) {
            throw conflict("Já existe usuário com este e-mail.");
        }
        validarPerfisDistintos(req.perfis());
        Instant agora = Instant.now();
        String provisoria = senhaProvisoriaGenerator.gerar();
        var u = new Usuario();
        u.setNome(req.nome().trim());
        u.setEmail(req.email().trim().toLowerCase());
        u.setSenhaHash(passwordEncoder.encode(provisoria));
        u.setTelefone(blankToNull(req.telefone()));
        u.setAtivo(false);
        u.setRequerTrocaSenha(true);
        u.setCriadoEm(agora);
        u.setAtualizadoEm(agora);
        try {
            usuarioRepository.save(u);
        } catch (DataIntegrityViolationException ex) {
            throw conflict("Já existe usuário com este e-mail.");
        }
        substituirPerfis(u, req.perfis());
        emailNotificacaoService.enviarSenhaProvisoria(u.getEmail(), u.getNome(), provisoria);
        return toResponse(usuarioRepository.findById(u.getId()).orElseThrow(() -> notFound()));
    }

    @Transactional
    public AdminUsuarioResponse atualizar(Long id, UsuarioUpdateRequest req, Long operadorId) {
        var u = usuarioRepository.findById(id).orElseThrow(() -> notFound());
        if (usuarioRepository.existsByEmailIgnoreCaseAndIdNot(req.email().trim().toLowerCase(), id)) {
            throw conflict("Já existe usuário com este e-mail.");
        }
        validarPerfisDistintos(req.perfis());
        if (id.equals(operadorId)) {
            if (!req.ativo()) {
                throw badRequest("Você não pode desativar a própria conta.");
            }
            boolean tinhaAdmin = u.getPerfis().stream()
                    .anyMatch(p -> PerfilMacro.ADMINISTRATIVO.name().equals(p.getPerfil()));
            boolean mantemAdmin = req.perfis().contains(PerfilMacro.ADMINISTRATIVO);
            if (tinhaAdmin && !mantemAdmin) {
                throw badRequest("Você não pode remover o perfil ADMINISTRATIVO da própria conta.");
            }
        }
        if (req.ativo() && u.isRequerTrocaSenha()) {
            throw badRequest(
                    "Não é possível ativar a conta enquanto houver troca de senha pendente. O usuário deve concluir o primeiro acesso.");
        }
        u.setNome(req.nome().trim());
        u.setEmail(req.email().trim().toLowerCase());
        u.setTelefone(blankToNull(req.telefone()));
        u.setAtivo(req.ativo());
        u.setAtualizadoEm(Instant.now());
        try {
            usuarioRepository.save(u);
        } catch (DataIntegrityViolationException ex) {
            throw conflict("Já existe usuário com este e-mail.");
        }
        substituirPerfis(u, req.perfis());
        usuarioRepository.flush();
        return toResponse(usuarioRepository.findById(id).orElseThrow(() -> notFound()));
    }

    @Transactional
    public void resetarSenhaProvisoria(Long id) {
        var u = usuarioRepository.findById(id).orElseThrow(() -> notFound());
        String provisoria = senhaProvisoriaGenerator.gerar();
        u.setSenhaHash(passwordEncoder.encode(provisoria));
        u.setAtivo(false);
        u.setRequerTrocaSenha(true);
        u.setAtualizadoEm(Instant.now());
        usuarioRepository.save(u);
        emailNotificacaoService.enviarSenhaProvisoria(u.getEmail(), u.getNome(), provisoria);
    }

    private void validarPerfisDistintos(List<PerfilMacro> perfis) {
        var set = new LinkedHashSet<>(perfis);
        if (set.size() != perfis.size()) {
            throw badRequest("Perfis duplicados não são permitidos.");
        }
    }

    private void substituirPerfis(Usuario usuario, List<PerfilMacro> perfis) {
        usuarioPerfilRepository.deleteByUsuarioId(usuario.getId());
        for (PerfilMacro p : perfis) {
            usuarioPerfilRepository.save(UsuarioPerfil.associar(usuario, p));
        }
    }

    private AdminUsuarioResponse toResponse(Usuario u) {
        var perfis = u.getPerfis().stream()
                .map(UsuarioPerfil::getPerfil)
                .sorted()
                .collect(Collectors.toList());
        return new AdminUsuarioResponse(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getTelefone(),
                u.isAtivo(),
                u.isRequerTrocaSenha(),
                perfis,
                u.getCriadoEm(),
                u.getAtualizadoEm());
    }

    private static String blankToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado.");
    }

    private static ResponseStatusException conflict(String msg) {
        return new ResponseStatusException(HttpStatus.CONFLICT, msg);
    }

    private static ResponseStatusException badRequest(String msg) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }
}
