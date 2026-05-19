package br.com.catec.api.v1.auth;

import br.com.catec.security.UsuarioAutenticado;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Auth", description = "Login e troca de senha provisória")
@RestController
@RequestMapping("/api/v1/auth")
@Validated
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Autenticar", description = "Retorna JWT (`accessToken`) para o cabeçalho Authorization: Bearer …")
    @SecurityRequirements
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest body) {
        return authService.login(body.email(), body.password());
    }

    @Operation(summary = "Definir nova senha", description = "Usuário autenticado com senha provisória troca a senha e recebe novo token.")
    @PostMapping("/trocar-senha")
    public LoginResponse trocarSenha(
            @Valid @RequestBody NovaSenhaRequest body, @AuthenticationPrincipal UsuarioAutenticado principal) {
        return authService.definirNovaSenha(principal.id(), body.senhaNova());
    }
}
