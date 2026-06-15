package br.com.catec.api.v1.proposta;

import br.com.catec.security.UsuarioAutenticado;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Propostas", description = "Fila e parecer do sócio (perfil SOCIO)")
@RestController
@RequestMapping("/api/v1/socio/propostas")
@PreAuthorize("hasRole('SOCIO')")
public class SocioPropostaController {

    private final PropostaService propostaService;

    public SocioPropostaController(PropostaService propostaService) {
        this.propostaService = propostaService;
    }

    @Operation(summary = "Fila de propostas pendentes", description = "Propostas em PENDENTE_AVALIACAO_SOCIO visíveis ao perfil SOCIO.")
    @GetMapping("/pendentes")
    public List<PropostaPendenteSocioResponse> listarPendentes(@AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.listarPendentesSocio(principal);
    }

    @Operation(summary = "Aprovar proposta (sócio)", description = "Transição para APROVADA_INTERNA. Corpo: projetoId, observacao opcional.")
    @PostMapping("/{propostaId}/aprovar")
    public PropostaResponse aprovar(
            @PathVariable Long propostaId,
            @Valid @RequestBody PropostaAvaliacaoSocioRequest body,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.aprovarPeloSocio(body.projetoId(), propostaId, body.observacao(), principal);
    }

    @Operation(summary = "Devolver proposta ao rascunho", description = "Parecer (observacao) obrigatório. Corpo: projetoId, observacao.")
    @PostMapping("/{propostaId}/devolver")
    public PropostaResponse devolver(
            @PathVariable Long propostaId,
            @Valid @RequestBody PropostaAvaliacaoSocioRequest body,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.devolverParaRascunho(body.projetoId(), propostaId, body.observacao(), principal);
    }
}
