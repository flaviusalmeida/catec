package br.com.catec.api.v1.documento;

import br.com.catec.config.AppDocumentoProperties;
import br.com.catec.domain.documento.Documento;
import br.com.catec.domain.documento.DocumentoRepository;
import br.com.catec.domain.documento.TipoVinculoDocumento;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.proposta.PropostaRepository;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.security.UsuarioAutenticado;
import br.com.catec.storage.DocumentStorage;
import java.io.IOException;
import java.time.Instant;
import java.time.YearMonth;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DocumentoService {

    private final DocumentoRepository documentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProjetoRepository projetoRepository;
    private final PropostaRepository propostaRepository;
    private final DocumentoAutorizacaoService documentoAutorizacaoService;
    private final DocumentStorage documentStorage;
    private final AppDocumentoProperties properties;

    public DocumentoService(
            DocumentoRepository documentoRepository,
            UsuarioRepository usuarioRepository,
            ProjetoRepository projetoRepository,
            PropostaRepository propostaRepository,
            DocumentoAutorizacaoService documentoAutorizacaoService,
            DocumentStorage documentStorage,
            AppDocumentoProperties properties) {
        this.documentoRepository = documentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.projetoRepository = projetoRepository;
        this.propostaRepository = propostaRepository;
        this.documentoAutorizacaoService = documentoAutorizacaoService;
        this.documentStorage = documentStorage;
        this.properties = properties;
    }

    @Transactional
    public DocumentoResponse upload(
            TipoVinculoDocumento tipoVinculo,
            Long vinculoId,
            String tipoArquivo,
            MultipartFile file,
            UsuarioAutenticado principal) {
        if (tipoVinculo == TipoVinculoDocumento.PROPOSTA) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Use POST /api/v1/projetos/{projetoId}/propostas/{propostaId}/documentos para anexar à proposta.");
        }
        return persistirUpload(tipoVinculo, vinculoId, tipoArquivo, file, principal);
    }

    @Transactional
    public DocumentoResponse uploadProposta(
            Long propostaId, String tipoArquivo, MultipartFile file, UsuarioAutenticado principal) {
        return persistirUpload(TipoVinculoDocumento.PROPOSTA, propostaId, tipoArquivo, file, principal);
    }

    private DocumentoResponse persistirUpload(
            TipoVinculoDocumento tipoVinculo,
            Long vinculoId,
            String tipoArquivo,
            MultipartFile file,
            UsuarioAutenticado principal) {
        validarArquivo(file);
        validarVinculo(tipoVinculo, vinculoId);
        documentoAutorizacaoService.garantirEscrita(tipoVinculo, vinculoId, principal);

        String mimeType = normalizarMime(file.getContentType());
        validarMime(mimeType);

        String nomeOriginal = sanitizarNomeOriginal(file.getOriginalFilename());
        int proximaVersao = documentoRepository.findMaxVersao(tipoVinculo, vinculoId) + 1;
        String chaveStorage = gerarChaveStorage();

        try {
            documentStorage.store(chaveStorage, file.getInputStream(), file.getSize());
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não foi possível ler o arquivo enviado.");
        }

        Usuario uploader = usuarioRepository.getReferenceById(principal.id());
        Documento doc = new Documento();
        doc.setTipoVinculo(tipoVinculo);
        doc.setVinculoId(vinculoId);
        doc.setTipoArquivo(normalizarTipoArquivo(tipoArquivo));
        doc.setNomeOriginal(nomeOriginal);
        doc.setChaveStorage(chaveStorage);
        doc.setMimeType(mimeType);
        doc.setTamanhoBytes(file.getSize());
        doc.setVersao(proximaVersao);
        doc.setUploadedPor(uploader);
        doc.setCriadoEm(Instant.now());

        Documento salvo = documentoRepository.save(doc);
        return toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listarPorVinculo(
            TipoVinculoDocumento tipoVinculo, Long vinculoId, UsuarioAutenticado principal) {
        validarVinculo(tipoVinculo, vinculoId);
        documentoAutorizacaoService.garantirLeituraVinculo(tipoVinculo, vinculoId, principal);
        return documentoRepository.findByTipoVinculoAndVinculoIdOrderByVersaoDesc(tipoVinculo, vinculoId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentoResponse obter(Long id, UsuarioAutenticado principal) {
        Documento doc = buscar(id);
        documentoAutorizacaoService.garantirLeitura(doc, principal);
        return toResponse(doc);
    }

    @Transactional(readOnly = true)
    public DocumentoDownload obterConteudo(Long id, UsuarioAutenticado principal) {
        Documento doc = buscar(id);
        documentoAutorizacaoService.garantirLeitura(doc, principal);
        Resource resource = documentStorage.loadAsResource(doc.getChaveStorage());
        return new DocumentoDownload(doc.getNomeOriginal(), doc.getMimeType(), doc.getTamanhoBytes(), resource);
    }

    private Documento buscar(Long id) {
        return documentoRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Documento não encontrado."));
    }

    private void validarVinculo(TipoVinculoDocumento tipoVinculo, Long vinculoId) {
        if (vinculoId == null || vinculoId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "vinculoId inválido.");
        }
        if (tipoVinculo == TipoVinculoDocumento.PROJETO && !projetoRepository.existsById(vinculoId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Projeto não encontrado para o vínculo informado.");
        }
        if (tipoVinculo == TipoVinculoDocumento.PROPOSTA && !propostaRepository.existsById(vinculoId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Proposta não encontrada para o vínculo informado.");
        }
    }

    private void validarArquivo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo obrigatório.");
        }
        if (file.getSize() > properties.getMaxSizeBytes()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Arquivo excede o tamanho máximo permitido (%d bytes)."
                            .formatted(properties.getMaxSizeBytes()));
        }
    }

    private void validarMime(String mimeType) {
        boolean allowed = properties.getAllowedMimeTypes().stream()
                .map(m -> m.toLowerCase(Locale.ROOT))
                .anyMatch(m -> m.equals(mimeType));
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de arquivo não permitido: " + mimeType);
        }
    }

    private static String normalizarMime(String contentType) {
        if (!StringUtils.hasText(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content-Type do arquivo é obrigatório.");
        }
        return contentType.split(";", 2)[0].trim().toLowerCase(Locale.ROOT);
    }

    private static String sanitizarNomeOriginal(String original) {
        if (!StringUtils.hasText(original)) {
            return "arquivo";
        }
        String name = StringUtils.cleanPath(original);
        int slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        if (slash >= 0) {
            name = name.substring(slash + 1);
        }
        if (!StringUtils.hasText(name) || ".".equals(name) || "..".equals(name)) {
            return "arquivo";
        }
        return name.length() > 500 ? name.substring(0, 500) : name;
    }

    private static String normalizarTipoArquivo(String tipoArquivo) {
        if (!StringUtils.hasText(tipoArquivo)) {
            return null;
        }
        String t = tipoArquivo.trim();
        return t.length() > 60 ? t.substring(0, 60) : t;
    }

    private static String gerarChaveStorage() {
        YearMonth ym = YearMonth.now();
        return "%d/%02d/%s".formatted(ym.getYear(), ym.getMonthValue(), UUID.randomUUID());
    }

    private DocumentoResponse toResponse(Documento doc) {
        Usuario uploader = doc.getUploadedPor();
        return new DocumentoResponse(
                doc.getId(),
                doc.getTipoVinculo(),
                doc.getVinculoId(),
                doc.getTipoArquivo(),
                doc.getNomeOriginal(),
                doc.getMimeType(),
                doc.getTamanhoBytes(),
                doc.getVersao(),
                uploader.getId(),
                uploader.getNome(),
                doc.getCriadoEm());
    }

    public record DocumentoDownload(String nomeOriginal, String mimeType, long tamanhoBytes, Resource resource) {}
}
