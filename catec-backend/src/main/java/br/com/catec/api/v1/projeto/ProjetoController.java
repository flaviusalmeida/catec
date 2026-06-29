package br.com.catec.api.v1.projeto;

import br.com.catec.api.v1.common.PageResponse;
import br.com.catec.security.UsuarioAutenticado;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Projetos", description = "Projetos comerciais e vínculo com cliente")
@RestController
@RequestMapping("/api/v1/projetos")
public class ProjetoController {

    private final ProjetoService projetoService;
    private final ProjetoHistoricoService projetoHistoricoService;

    public ProjetoController(ProjetoService projetoService, ProjetoHistoricoService projetoHistoricoService) {
        this.projetoService = projetoService;
        this.projetoHistoricoService = projetoHistoricoService;
    }

    @Operation(summary = "Listar projetos", description = "Colaborador vê só os que criou; ADM e Sócio veem todos.")
    @GetMapping
    @PreAuthorize("@authz.has('tela.projetos')")
    public List<ProjetoResponse> listar(@AuthenticationPrincipal UsuarioAutenticado principal) {
        return projetoService.listar(principal);
    }

    @Operation(summary = "Detalhe do projeto")
    @GetMapping("/{id}")
    @PreAuthorize("@authz.has('tela.projeto.detalhe')")
    public ProjetoResponse obter(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado principal) {
        return projetoService.obter(id, principal);
    }

    @Operation(summary = "Criar projeto", description = "Colaborador ou ADM. Cliente pode ser associado depois.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@authz.has('acao.projeto.criar')")
    public ProjetoResponse criar(
            @Valid @RequestBody ProjetoCreateRequest body, @AuthenticationPrincipal UsuarioAutenticado principal) {
        return projetoService.criar(body, principal);
    }

    @Operation(summary = "Atualizar projeto")
    @PutMapping("/{id}")
    @PreAuthorize("@authz.has('acao.projeto.editar')")
    public ProjetoResponse atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProjetoUpdateRequest body,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return projetoService.atualizar(id, body, principal);
    }

    @Operation(summary = "Associar cliente ao projeto")
    @PutMapping("/{id}/cliente")
    @PreAuthorize("@authz.has('acao.projeto.associar_cliente')")
    public ProjetoResponse associarCliente(
            @PathVariable Long id,
            @Valid @RequestBody ProjetoAssociarClienteRequest body,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return projetoService.associarCliente(id, body, principal);
    }

    @Operation(
            summary = "Histórico do projeto",
            description = "União de auditoria_fluxo (projeto e propostas) e interacao_fluxo das propostas, ordenado por data descendente.")
    @GetMapping("/{id}/historico")
    @PreAuthorize("@authz.has('tela.projeto.detalhe')")
    public PageResponse<ProjetoHistoricoItemResponse> historico(
            @AuthenticationPrincipal UsuarioAutenticado principal,
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return projetoHistoricoService.historico(principal, id, page, size);
    }
}
