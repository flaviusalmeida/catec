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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/clientes")
@PreAuthorize("hasRole('ADMINISTRATIVO')")
public class AdminClienteController {

    private final AdminClienteService adminClienteService;

    public AdminClienteController(AdminClienteService adminClienteService) {
        this.adminClienteService = adminClienteService;
    }

    @GetMapping
    public List<ClienteResponse> listar() {
        return adminClienteService.listar();
    }

    @GetMapping("/{id}")
    public ClienteResponse obter(@PathVariable Long id) {
        return adminClienteService.obter(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteResponse criar(@Valid @RequestBody ClienteRequest body) {
        return adminClienteService.criar(body);
    }

    @PutMapping("/{id}")
    public ClienteResponse atualizar(@PathVariable Long id, @Valid @RequestBody ClienteRequest body) {
        return adminClienteService.atualizar(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id) {
        adminClienteService.remover(id);
    }
}
