package br.com.catec.api.v1.proposta;

import br.com.catec.api.v1.documento.DocumentoResponse;
import br.com.catec.api.v1.interacao.InteracaoFluxoCreateRequest;
import br.com.catec.api.v1.interacao.InteracaoFluxoResponse;
import br.com.catec.api.v1.interacao.InteracaoFluxoService;
import br.com.catec.api.v1.interacao.RegistroRespostaClienteResponse;
import br.com.catec.security.UsuarioAutenticado;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Propostas", description = "Proposta comercial, anexos, interações e transições de status")
@RestController
@RequestMapping("/api/v1/projetos/{projetoId}/propostas")
@PreAuthorize("hasAnyRole('COLABORADOR','ADMINISTRATIVO','SOCIO')")
public class PropostaController {

    private final PropostaService propostaService;
    private final InteracaoFluxoService interacaoFluxoService;

    public PropostaController(PropostaService propostaService, InteracaoFluxoService interacaoFluxoService) {
        this.propostaService = propostaService;
        this.interacaoFluxoService = interacaoFluxoService;
    }

    @GetMapping
    public List<PropostaResponse> listar(
            @PathVariable Long projetoId, @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.listarPorProjeto(projetoId, principal);
    }

    @GetMapping("/{propostaId}")
    public PropostaResponse obter(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.obter(projetoId, propostaId, principal);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PropostaResponse criar(
            @PathVariable Long projetoId,
            @Valid @RequestBody PropostaCreateRequest body,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.criar(projetoId, body.requerAvaliacaoSocio(), principal);
    }

    @PostMapping("/{propostaId}/submeter-avaliacao-socio")
    public PropostaResponse submeterParaAvaliacaoSocio(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.submeterParaAvaliacaoSocio(projetoId, propostaId, principal);
    }

    @PostMapping("/{propostaId}/aprovar-interna")
    public PropostaResponse aprovarInternamenteSemSocio(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.aprovarInternamenteSemSocio(projetoId, propostaId, principal);
    }

    @PostMapping("/{propostaId}/aprovar-socio")
    public PropostaResponse aprovarPeloSocio(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.aprovarPeloSocio(projetoId, propostaId, principal);
    }

    @PostMapping("/{propostaId}/devolver-rascunho")
    public PropostaResponse devolverParaRascunho(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.devolverParaRascunho(projetoId, propostaId, principal);
    }

    @PostMapping("/{propostaId}/enviar-cliente")
    public PropostaResponse enviarAoCliente(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.enviarAoCliente(projetoId, propostaId, principal);
    }

    @GetMapping("/{propostaId}/documentos")
    public List<DocumentoResponse> listarDocumentos(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.listarDocumentos(projetoId, propostaId, principal);
    }

    @PostMapping(value = "/{propostaId}/documentos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentoResponse uploadDocumento(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @RequestParam(required = false) String tipoArquivo,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.uploadDocumento(projetoId, propostaId, tipoArquivo, file, principal);
    }

    @GetMapping("/{propostaId}/interacoes")
    public List<InteracaoFluxoResponse> listarInteracoes(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return interacaoFluxoService.listarPorProposta(projetoId, propostaId, principal);
    }

    @PostMapping("/{propostaId}/interacoes")
    @ResponseStatus(HttpStatus.CREATED)
    public RegistroRespostaClienteResponse registrarRespostaCliente(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @Valid @RequestBody InteracaoFluxoCreateRequest body,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        var result = interacaoFluxoService.registrarRespostaCliente(projetoId, propostaId, body, principal);
        return new RegistroRespostaClienteResponse(result.interacao(), result.proposta());
    }
}
