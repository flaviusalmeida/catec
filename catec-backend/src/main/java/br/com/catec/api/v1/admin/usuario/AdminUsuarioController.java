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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Usuários", description = "Gestão de usuários e grupos de acesso")
@RestController
@RequestMapping("/api/v1/admin/usuarios")
@PreAuthorize("@authz.has('acao.usuario.gerir')")
public class AdminUsuarioController {

    private final AdminUsuarioService adminUsuarioService;

    public AdminUsuarioController(AdminUsuarioService adminUsuarioService) {
        this.adminUsuarioService = adminUsuarioService;
    }

    @Operation(summary = "Listar usuários")
    @GetMapping
    public List<AdminUsuarioResponse> listar() {
        return adminUsuarioService.listar();
    }

    @Operation(summary = "Detalhe do usuário")
    @GetMapping("/{id}")
    public AdminUsuarioResponse obter(@PathVariable Long id) {
        return adminUsuarioService.obter(id);
    }

    @Operation(summary = "Criar usuário", description = "Corpo: nome, email, telefone opcional, grupos (códigos, ex.: COLABORADOR).")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminUsuarioResponse criar(@Valid @RequestBody UsuarioCreateRequest body) {
        return adminUsuarioService.criar(body);
    }

    @Operation(summary = "Atualizar usuário", description = "Não desativar a própria conta nem remover o próprio grupo ADMINISTRATIVO.")
    @PutMapping("/{id}")
    public AdminUsuarioResponse atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioUpdateRequest body,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return adminUsuarioService.atualizar(id, body, principal.id());
    }

    @Operation(summary = "Resetar senha provisória")
    @PostMapping("/{id}/resetar-senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@authz.has('acao.usuario.redefinir_senha')")
    public void resetarSenha(@PathVariable Long id) {
        adminUsuarioService.resetarSenhaProvisoria(id);
    }
}
