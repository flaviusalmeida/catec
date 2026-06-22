package br.com.catec.api.v1.admin.cliente;

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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Clientes", description = "CRUD de clientes (perfil ADMINISTRATIVO)")
@RestController
@RequestMapping("/api/v1/admin/clientes")
public class AdminClienteController {

    private final AdminClienteService adminClienteService;

    public AdminClienteController(AdminClienteService adminClienteService) {
        this.adminClienteService = adminClienteService;
    }

    @Operation(summary = "Listar clientes")
    @GetMapping
    @PreAuthorize("@authz.has('tela.clientes')")
    public List<ClienteResponse> listar() {
        return adminClienteService.listar();
    }

    @Operation(summary = "Detalhe do cliente")
    @GetMapping("/{id}")
    @PreAuthorize("@authz.has('tela.clientes')")
    public ClienteResponse obter(@PathVariable Long id) {
        return adminClienteService.obter(id);
    }

    @Operation(summary = "Criar cliente")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@authz.has('acao.cliente.criar')")
    public ClienteResponse criar(@Valid @RequestBody ClienteRequest body) {
        return adminClienteService.criar(body);
    }

    @Operation(summary = "Atualizar cliente")
    @PutMapping("/{id}")
    @PreAuthorize("@authz.has('acao.cliente.editar')")
    public ClienteResponse atualizar(@PathVariable Long id, @Valid @RequestBody ClienteRequest body) {
        return adminClienteService.atualizar(id, body);
    }

    @Operation(summary = "Remover cliente")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@authz.has('acao.cliente.excluir')")
    public void remover(@PathVariable Long id) {
        adminClienteService.remover(id);
    }
}
