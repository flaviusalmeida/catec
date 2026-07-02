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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Propostas", description = "Proposta comercial, anexos, interações e transições de status")
@RestController
@RequestMapping("/api/v1/projetos/{projetoId}/propostas")
@PreAuthorize("@authz.has('tela.projeto.detalhe')")
public class PropostaController {

    private final PropostaService propostaService;
    private final InteracaoFluxoService interacaoFluxoService;

    public PropostaController(PropostaService propostaService, InteracaoFluxoService interacaoFluxoService) {
        this.propostaService = propostaService;
        this.interacaoFluxoService = interacaoFluxoService;
    }

    @Operation(summary = "Listar propostas do projeto")
    @GetMapping
    public List<PropostaResponse> listar(
            @PathVariable Long projetoId, @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.listarPorProjeto(projetoId, principal);
    }

    @Operation(summary = "Detalhe da proposta")
    @GetMapping("/{propostaId}")
    public PropostaResponse obter(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.obter(projetoId, propostaId, principal);
    }

    @Operation(summary = "Criar proposta", description = "Só ADMINISTRATIVO.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PropostaResponse criar(
            @PathVariable Long projetoId, @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.criar(projetoId, principal);
    }

    @Operation(summary = "Submeter para avaliação do sócio", description = "RASCUNHO → PENDENTE_AVALIACAO.")
    @PostMapping("/{propostaId}/submeter-avaliacao-socio")
    public PropostaResponse submeterParaAvaliacaoSocio(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.submeterParaAvaliacaoSocio(projetoId, propostaId, principal);
    }

    @Operation(summary = "Aprovar pelo sócio (via projeto)", description = "Preferir fila em /api/v1/socio/propostas quando aplicável.")
    @PostMapping("/{propostaId}/aprovar-socio")
    public PropostaResponse aprovarPeloSocio(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @RequestBody(required = false) PropostaParecerRequest body,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        String observacao = body != null ? body.observacao() : null;
        return propostaService.aprovarPeloSocio(projetoId, propostaId, observacao, principal);
    }

    @Operation(summary = "Devolver para elaboração (via projeto)", description = "Parecer (observacao) obrigatório no corpo.")
    @PostMapping("/{propostaId}/devolver-rascunho")
    public PropostaResponse devolverParaRascunho(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @Valid @RequestBody PropostaParecerRequest body,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.devolverParaRascunho(projetoId, propostaId, body.observacao(), principal);
    }

    @Operation(summary = "Enviar proposta ao cliente", description = "ADM. Exige proposta em RASCUNHO com parecer do sócio.")
    @PostMapping("/{propostaId}/enviar-cliente")
    public PropostaResponse enviarAoCliente(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.enviarAoCliente(projetoId, propostaId, principal);
    }

    @Operation(summary = "Listar anexos da proposta")
    @GetMapping("/{propostaId}/documentos")
    public List<DocumentoResponse> listarDocumentos(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.listarDocumentos(projetoId, propostaId, principal);
    }

    @Operation(
            summary = "Anexar documento à proposta vigente",
            description = "Multipart `file`. Cria proposta em rascunho se necessário; estados RASCUNHO ou PENDENTE_AVALIACAO.")
    @PostMapping(value = "/documentos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentoResponse uploadDocumentoNoFluxo(
            @PathVariable Long projetoId,
            @RequestParam(required = false) String tipoArquivo,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return propostaService.uploadDocumentoNoFluxo(projetoId, tipoArquivo, file, principal);
    }

    @Operation(
            summary = "Anexar documento à proposta",
            description = "Multipart `file`. Só ADM; estados RASCUNHO ou PENDENTE_AVALIACAO.")
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

    @Operation(summary = "Listar interações / respostas do cliente")
    @GetMapping("/{propostaId}/interacoes")
    public List<InteracaoFluxoResponse> listarInteracoes(
            @PathVariable Long projetoId,
            @PathVariable Long propostaId,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return interacaoFluxoService.listarPorProposta(projetoId, propostaId, principal);
    }

    @Operation(
            summary = "Registrar resposta do cliente",
            description = "ADM. Tipos: CONSIDERACOES_CLIENTE, ACEITE_CLIENTE, RECUSA_CLIENTE.")
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
