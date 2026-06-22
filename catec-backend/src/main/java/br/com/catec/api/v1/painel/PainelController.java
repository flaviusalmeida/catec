package br.com.catec.api.v1.painel;

import br.com.catec.api.v1.common.PageResponse;
import br.com.catec.domain.painel.FaseMacro;
import br.com.catec.security.UsuarioAutenticado;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Instant;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Painel", description = "Resumo, indicadores e histórico do fluxo comercial (somente leitura)")
@RestController
@RequestMapping("/api/v1/painel")
@PreAuthorize("@authz.has('tela.painel')")
public class PainelController {

    private final PainelService painelService;

    public PainelController(PainelService painelService) {
        this.painelService = painelService;
    }

    @Operation(
            summary = "Resumo paginado de projetos",
            description =
                    "Lista projetos visíveis ao usuário com fase macro derivada (proposta vigente tem prioridade sobre status do projeto). "
                            + "Filtros: clienteId, status (fase macro), prazoAte (atualizado_em do projeto ≤ data).")
    @GetMapping("/resumo")
    public PageResponse<PainelProjetoResumoResponse> resumo(
            @AuthenticationPrincipal UsuarioAutenticado principal,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) FaseMacro status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant prazoAte,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return painelService.resumo(principal, clienteId, status, prazoAte, page, size);
    }

    @Operation(summary = "Indicadores do painel", description = "Contadores mínimos do fluxo comercial no escopo do usuário.")
    @GetMapping("/indicadores")
    public PainelIndicadoresResponse indicadores(@AuthenticationPrincipal UsuarioAutenticado principal) {
        return painelService.indicadores(principal);
    }

    @Operation(
            summary = "Histórico do projeto",
            description = "União de auditoria_fluxo (projeto e propostas) e interacao_fluxo das propostas, ordenado por data descendente.")
    @GetMapping("/projetos/{projetoId}/historico")
    public PageResponse<PainelHistoricoItemResponse> historico(
            @AuthenticationPrincipal UsuarioAutenticado principal,
            @PathVariable Long projetoId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return painelService.historico(principal, projetoId, page, size);
    }
}
