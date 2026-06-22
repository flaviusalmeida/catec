package br.com.catec.api.v1.admin.grupo;

import br.com.catec.domain.acesso.GrupoAcesso;
import br.com.catec.domain.acesso.GrupoAcessoRepository;
import br.com.catec.domain.acesso.Permissao;
import br.com.catec.domain.acesso.PermissaoRepository;
import java.text.Normalizer;
import java.time.Instant;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminGrupoService {

    private final GrupoAcessoRepository grupoAcessoRepository;
    private final PermissaoRepository permissaoRepository;

    public AdminGrupoService(GrupoAcessoRepository grupoAcessoRepository, PermissaoRepository permissaoRepository) {
        this.grupoAcessoRepository = grupoAcessoRepository;
        this.permissaoRepository = permissaoRepository;
    }

    @Transactional(readOnly = true)
    public List<PermissaoResponse> listarCatalogoPermissoes() {
        return permissaoRepository.findAllByOrderByModuloAscTipoAscNomeAsc().stream()
                .map(this::toPermissaoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GrupoResponse> listar() {
        return grupoAcessoRepository.findAllByOrderByNomeAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public GrupoResponse obter(Long id) {
        return grupoAcessoRepository.findById(id).map(this::toResponse).orElseThrow(this::notFound);
    }

    @Transactional
    public GrupoResponse criar(GrupoCreateRequest req) {
        Instant agora = Instant.now();
        String codigo = gerarCodigoUnico(req.nome().trim());
        var grupo = new GrupoAcesso();
        grupo.setCodigo(codigo);
        grupo.setNome(req.nome().trim());
        grupo.setDescricao(blankToNull(req.descricao()));
        grupo.setAtivo(true);
        grupo.setSistema(false);
        grupo.setCriadoEm(agora);
        grupo.setAtualizadoEm(agora);
        grupo.setPermissoes(resolverPermissoes(req.permissoes()));
        grupoAcessoRepository.save(grupo);
        return toResponse(grupoAcessoRepository.findById(grupo.getId()).orElseThrow(this::notFound));
    }

    @Transactional
    public GrupoResponse atualizar(Long id, GrupoUpdateRequest req) {
        var grupo = grupoAcessoRepository.findById(id).orElseThrow(this::notFound);
        grupo.setNome(req.nome().trim());
        grupo.setDescricao(blankToNull(req.descricao()));
        grupo.setAtivo(req.ativo());
        grupo.setAtualizadoEm(Instant.now());
        grupo.setPermissoes(resolverPermissoes(req.permissoes()));
        grupoAcessoRepository.save(grupo);
        return toResponse(grupoAcessoRepository.findById(id).orElseThrow(this::notFound));
    }

    @Transactional
    public void excluir(Long id) {
        var grupo = grupoAcessoRepository.findById(id).orElseThrow(this::notFound);
        if (grupo.isSistema()) {
            throw badRequest("Grupos padrão do sistema não podem ser excluídos.");
        }
        grupoAcessoRepository.delete(grupo);
    }

    private Set<Permissao> resolverPermissoes(List<String> codigos) {
        var distintos = codigos.stream().map(String::trim).collect(Collectors.toCollection(LinkedHashSet::new));
        var encontradas = permissaoRepository.findByCodigoIn(List.copyOf(distintos));
        if (encontradas.size() != distintos.size()) {
            var validos = encontradas.stream().map(Permissao::getCodigo).collect(Collectors.toSet());
            var invalidos = distintos.stream().filter(c -> !validos.contains(c)).toList();
            throw badRequest("Permissões inválidas: " + String.join(", ", invalidos));
        }
        return new HashSet<>(encontradas);
    }

    private String gerarCodigoUnico(String nome) {
        String base = Normalizer.normalize(nome, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9]+", "_")
                .replaceAll("^_|_$", "");
        if (base.isBlank()) {
            base = "GRUPO";
        }
        if (base.length() > 32) {
            base = base.substring(0, 32);
        }
        String codigo = base;
        int sufixo = 2;
        while (grupoAcessoRepository.existsByCodigo(codigo)) {
            String suffix = "_" + sufixo;
            int maxBase = 40 - suffix.length();
            codigo = base.substring(0, Math.min(base.length(), maxBase)) + suffix;
            sufixo++;
        }
        return codigo;
    }

    private GrupoResponse toResponse(GrupoAcesso grupo) {
        var permissoes = grupo.getPermissoes().stream()
                .map(Permissao::getCodigo)
                .sorted()
                .toList();
        return new GrupoResponse(
                grupo.getId(),
                grupo.getCodigo(),
                grupo.getNome(),
                grupo.getDescricao(),
                grupo.isAtivo(),
                grupo.isSistema(),
                permissoes,
                grupo.getCriadoEm(),
                grupo.getAtualizadoEm());
    }

    private PermissaoResponse toPermissaoResponse(Permissao permissao) {
        return new PermissaoResponse(
                permissao.getId(),
                permissao.getCodigo(),
                permissao.getNome(),
                permissao.getTipo(),
                permissao.getModulo(),
                permissao.getDescricao());
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Grupo não encontrado.");
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
