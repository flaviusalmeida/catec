package br.com.catec.api.v1.admin.usuario;

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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/usuarios")
@PreAuthorize("hasRole('ADMINISTRATIVO')")
public class AdminUsuarioController {

    private final AdminUsuarioService adminUsuarioService;

    public AdminUsuarioController(AdminUsuarioService adminUsuarioService) {
        this.adminUsuarioService = adminUsuarioService;
    }

    @GetMapping
    public List<AdminUsuarioResponse> listar() {
        return adminUsuarioService.listar();
    }

    @GetMapping("/{id}")
    public AdminUsuarioResponse obter(@PathVariable Long id) {
        return adminUsuarioService.obter(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminUsuarioResponse criar(@Valid @RequestBody UsuarioCreateRequest body) {
        return adminUsuarioService.criar(body);
    }

    @PutMapping("/{id}")
    public AdminUsuarioResponse atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioUpdateRequest body,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return adminUsuarioService.atualizar(id, body, principal.id());
    }

    @PostMapping("/{id}/resetar-senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetarSenha(@PathVariable Long id) {
        adminUsuarioService.resetarSenhaProvisoria(id);
    }
}
