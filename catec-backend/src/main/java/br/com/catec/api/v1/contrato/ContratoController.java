package br.com.catec.api.v1.contrato;

import br.com.catec.api.v1.documento.DocumentoResponse;
import br.com.catec.api.v1.interacao.InteracaoFluxoCreateRequest;
import br.com.catec.api.v1.interacao.InteracaoFluxoResponse;
import br.com.catec.api.v1.interacao.InteracaoFluxoService;
import br.com.catec.api.v1.interacao.RegistroInteracaoContratoResponse;
import br.com.catec.security.UsuarioAutenticado;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
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
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Contratos", description = "Contrato do projeto e anexos")
@RestController
@RequestMapping("/api/v1/projetos/{projetoId}/contratos")
@PreAuthorize("hasAnyRole('COLABORADOR','ADMINISTRATIVO','SOCIO')")
public class ContratoController {

    private final ContratoService contratoService;
    private final InteracaoFluxoService interacaoFluxoService;

    public ContratoController(ContratoService contratoService, InteracaoFluxoService interacaoFluxoService) {
        this.contratoService = contratoService;
        this.interacaoFluxoService = interacaoFluxoService;
    }

    @GetMapping
    public List<ContratoResponse> listar(
            @PathVariable Long projetoId, @AuthenticationPrincipal UsuarioAutenticado principal) {
        return contratoService.listarPorProjeto(projetoId, principal);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContratoResponse criar(
            @PathVariable Long projetoId, @AuthenticationPrincipal UsuarioAutenticado principal) {
        return contratoService.criar(projetoId, principal);
    }

    @GetMapping("/{contratoId}")
    public ContratoResponse obter(
            @PathVariable Long projetoId,
            @PathVariable Long contratoId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return contratoService.obter(projetoId, contratoId, principal);
    }

    @GetMapping("/{contratoId}/documentos")
    public List<DocumentoResponse> listarDocumentos(
            @PathVariable Long projetoId,
            @PathVariable Long contratoId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return contratoService.listarDocumentos(projetoId, contratoId, principal);
    }

    @PostMapping(value = "/{contratoId}/documentos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentoResponse uploadDocumento(
            @PathVariable Long projetoId,
            @PathVariable Long contratoId,
            @RequestParam(required = false) String tipoArquivo,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return contratoService.uploadDocumento(projetoId, contratoId, tipoArquivo, file, principal);
    }

    @PostMapping("/{contratoId}/enviar-cliente")
    public ContratoResponse enviarAoCliente(
            @PathVariable Long projetoId,
            @PathVariable Long contratoId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return contratoService.enviarAoCliente(projetoId, contratoId, principal);
    }

    @GetMapping("/{contratoId}/interacoes")
    public List<InteracaoFluxoResponse> listarInteracoes(
            @PathVariable Long projetoId,
            @PathVariable Long contratoId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return interacaoFluxoService.listarPorContrato(projetoId, contratoId, principal);
    }

    @PostMapping("/{contratoId}/interacoes")
    @ResponseStatus(HttpStatus.CREATED)
    public RegistroInteracaoContratoResponse registrarInteracaoCliente(
            @PathVariable Long projetoId,
            @PathVariable Long contratoId,
            @Valid @RequestBody InteracaoFluxoCreateRequest body,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        var result = interacaoFluxoService.registrarInteracaoClienteContrato(projetoId, contratoId, body, principal);
        return new RegistroInteracaoContratoResponse(result.interacao(), result.contrato());
    }
}
