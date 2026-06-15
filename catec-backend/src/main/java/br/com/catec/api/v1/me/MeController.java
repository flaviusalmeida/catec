package br.com.catec.api.v1.me;

import br.com.catec.security.UsuarioAutenticado;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Sessão", description = "Perfil do usuário autenticado")
@RestController
@RequestMapping("/api/v1")
public class MeController {

    private final MeService meService;

    public MeController(MeService meService) {
        this.meService = meService;
    }

    @Operation(summary = "Perfil autenticado", description = "Retorna id, nome, e-mail e perfis do usuário do JWT.")
    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal UsuarioAutenticado principal) {
        return meService.obterPerfil(principal.id());
    }
}
