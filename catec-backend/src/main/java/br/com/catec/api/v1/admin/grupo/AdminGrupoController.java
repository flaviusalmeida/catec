package br.com.catec.api.v1.admin.grupo;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Grupos de acesso", description = "Gestão de grupos e permissões")
@RestController
@RequestMapping("/api/v1/admin/grupos")
@PreAuthorize("@authz.has('acao.grupo.gerir')")
public class AdminGrupoController {

    private final AdminGrupoService adminGrupoService;

    public AdminGrupoController(AdminGrupoService adminGrupoService) {
        this.adminGrupoService = adminGrupoService;
    }

    @Operation(summary = "Catálogo de permissões", description = "Lista todas as permissões disponíveis (telas e ações).")
    @GetMapping("/permissoes")
    public List<PermissaoResponse> listarPermissoes() {
        return adminGrupoService.listarCatalogoPermissoes();
    }

    @Operation(summary = "Listar grupos")
    @GetMapping
    public List<GrupoResponse> listar() {
        return adminGrupoService.listar();
    }

    @Operation(summary = "Detalhe do grupo")
    @GetMapping("/{id}")
    public GrupoResponse obter(@PathVariable Long id) {
        return adminGrupoService.obter(id);
    }

    @Operation(summary = "Criar grupo customizado")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GrupoResponse criar(@Valid @RequestBody GrupoCreateRequest body) {
        return adminGrupoService.criar(body);
    }

    @Operation(summary = "Atualizar grupo")
    @PutMapping("/{id}")
    public GrupoResponse atualizar(@PathVariable Long id, @Valid @RequestBody GrupoUpdateRequest body) {
        return adminGrupoService.atualizar(id, body);
    }

    @Operation(summary = "Excluir grupo", description = "Grupos padrão do sistema não podem ser excluídos.")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        adminGrupoService.excluir(id);
    }
}
