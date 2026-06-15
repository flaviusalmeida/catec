package br.com.catec.api.v1.documento;

import br.com.catec.domain.documento.TipoVinculoDocumento;
import br.com.catec.security.UsuarioAutenticado;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Documentos", description = "Upload e download de arquivos (exceto anexos de proposta — ver Propostas)")
@RestController
@RequestMapping("/api/v1/documentos")
@PreAuthorize("hasAnyRole('COLABORADOR','ADMINISTRATIVO','SOCIO')")
public class DocumentoController {

    private final DocumentoService documentoService;

    public DocumentoController(DocumentoService documentoService) {
        this.documentoService = documentoService;
    }

    @Operation(
            summary = "Upload de documento",
            description = "Multipart: `tipoVinculo` (ex. PROJETO), `vinculoId`, `file`. Anexos de proposta usam endpoint em Propostas.")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentoResponse upload(
            @RequestParam TipoVinculoDocumento tipoVinculo,
            @RequestParam Long vinculoId,
            @RequestParam(required = false) String tipoArquivo,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UsuarioAutenticado principal) {
        return documentoService.upload(tipoVinculo, vinculoId, tipoArquivo, file, principal);
    }

    @Operation(summary = "Metadados do documento")
    @GetMapping("/{id}")
    public DocumentoResponse obter(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado principal) {
        return documentoService.obter(id, principal);
    }

    @Operation(summary = "Download do arquivo", description = "Retorna bytes com Content-Disposition attachment.")
    @GetMapping("/{id}/conteudo")
    public ResponseEntity<Resource> download(
            @PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado principal) {
        DocumentoService.DocumentoDownload download = documentoService.obterConteudo(id, principal);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(download.nomeOriginal())
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.parseMediaType(download.mimeType()))
                .contentLength(download.tamanhoBytes())
                .body(download.resource());
    }
}
