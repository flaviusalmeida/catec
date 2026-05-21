package br.com.catec.api.v1.contrato;

import br.com.catec.api.v1.documento.DocumentoResponse;
import br.com.catec.api.v1.documento.DocumentoService;
import br.com.catec.domain.auditoria.AuditoriaService;
import br.com.catec.domain.auditoria.TipoEntidadeAuditoria;
import br.com.catec.domain.contrato.Contrato;
import br.com.catec.domain.contrato.ContratoRepository;
import br.com.catec.domain.contrato.ContratoStatus;
import br.com.catec.domain.documento.DocumentoRepository;
import br.com.catec.domain.documento.TipoVinculoDocumento;
import java.util.EnumSet;
import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.security.UsuarioAutenticado;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ContratoService {

    private static final EnumSet<ContratoStatus> STATUS_UPLOAD_DOCUMENTO =
            EnumSet.of(ContratoStatus.RASCUNHO, ContratoStatus.AGUARDANDO_AJUSTE_ADM);

    private final ContratoRepository contratoRepository;
    private final ProjetoRepository projetoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;
    private final DocumentoService documentoService;
    private final DocumentoRepository documentoRepository;

    public ContratoService(
            ContratoRepository contratoRepository,
            ProjetoRepository projetoRepository,
            UsuarioRepository usuarioRepository,
            AuditoriaService auditoriaService,
            DocumentoService documentoService,
            DocumentoRepository documentoRepository) {
        this.contratoRepository = contratoRepository;
        this.projetoRepository = projetoRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
        this.documentoService = documentoService;
        this.documentoRepository = documentoRepository;
    }

    @Transactional(readOnly = true)
    public List<ContratoResponse> listarPorProjeto(Long projetoId, UsuarioAutenticado principal) {
        Projeto projeto = loadProjeto(projetoId);
        garantirLeitura(projeto, principal);
        return contratoRepository.findByProjetoId(projetoId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ContratoResponse criar(Long projetoId, UsuarioAutenticado principal) {
        exigirAdministrativo(principal);
        Projeto projeto = loadProjeto(projetoId);
        validarProjetoParaNovoContrato(projeto);
        if (contratoRepository.existsByProjetoId(projetoId)) {
            throw badRequest("Este projeto já possui um contrato em elaboração.");
        }

        Instant agora = Instant.now();
        Usuario elaborador = usuarioRepository.getReferenceById(principal.id());

        Contrato contrato = new Contrato();
        contrato.setProjeto(projeto);
        contrato.setStatus(ContratoStatus.RASCUNHO);
        contrato.setElaboradoPor(elaborador);
        contrato.setConsideracoesPendentes(false);
        contrato.setCriadoEm(agora);
        contrato.setAtualizadoEm(agora);

        Contrato salvo = contratoRepository.save(contrato);
        auditoriaService.registrarTransicaoStatus(
                TipoEntidadeAuditoria.CONTRATO,
                salvo.getId(),
                "CRIAR",
                null,
                ContratoStatus.RASCUNHO.name(),
                principal.id());

        return toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public ContratoResponse obter(Long projetoId, Long contratoId, UsuarioAutenticado principal) {
        return toResponse(loadContratoDoProjeto(projetoId, contratoId, principal));
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listarDocumentos(
            Long projetoId, Long contratoId, UsuarioAutenticado principal) {
        Contrato contrato = loadContratoDoProjeto(projetoId, contratoId, principal);
        return documentoService.listarPorVinculo(TipoVinculoDocumento.CONTRATO, contrato.getId(), principal);
    }

    @Transactional
    public DocumentoResponse uploadDocumento(
            Long projetoId,
            Long contratoId,
            String tipoArquivo,
            MultipartFile file,
            UsuarioAutenticado principal) {
        exigirAdministrativo(principal);
        Contrato contrato = loadContratoDoProjeto(projetoId, contratoId, principal);
        if (!STATUS_UPLOAD_DOCUMENTO.contains(contrato.getStatus())) {
            throw badRequest("Não é possível anexar documentos no estado atual do contrato.");
        }
        return documentoService.uploadContrato(contrato.getId(), tipoArquivo, file, principal);
    }

    /** RASCUNHO com documento → ENVIADO_AO_CLIENTE. */
    @Transactional
    public ContratoResponse enviarAoCliente(Long projetoId, Long contratoId, UsuarioAutenticado principal) {
        exigirAdministrativo(principal);
        Contrato contrato = loadContratoDoProjeto(projetoId, contratoId, principal);
        if (contrato.getStatus() != ContratoStatus.RASCUNHO) {
            throw badRequest("Só é possível enviar ao cliente um contrato em rascunho.");
        }
        if (documentoRepository
                .findByTipoVinculoAndVinculoIdOrderByVersaoDesc(TipoVinculoDocumento.CONTRATO, contratoId)
                .isEmpty()) {
            throw badRequest("Anexe o documento do contrato antes de enviar ao cliente.");
        }
        ContratoStatus anterior = contrato.getStatus();
        Instant agora = Instant.now();
        contrato.setStatus(ContratoStatus.ENVIADO_AO_CLIENTE);
        contrato.setEnviadoClienteEm(agora);
        contrato.setAtualizadoEm(agora);
        Contrato salvo = contratoRepository.save(contrato);
        auditoriaService.registrarTransicaoStatus(
                TipoEntidadeAuditoria.CONTRATO,
                salvo.getId(),
                "ENVIAR_CLIENTE",
                anterior.name(),
                ContratoStatus.ENVIADO_AO_CLIENTE.name(),
                principal.id());
        return toResponse(salvo);
    }

    private void validarProjetoParaNovoContrato(Projeto projeto) {
        if (projeto.getStatus() != ProjetoStatus.AGUARDANDO_CONTRATO) {
            throw badRequest("Contrato só pode ser iniciado quando o projeto está aguardando contrato.");
        }
    }

    private Contrato loadContratoDoProjeto(Long projetoId, Long contratoId, UsuarioAutenticado principal) {
        Contrato contrato = contratoRepository
                .findById(contratoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado."));
        if (!contrato.getProjeto().getId().equals(projetoId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado neste projeto.");
        }
        garantirLeitura(contrato.getProjeto(), principal);
        return contrato;
    }

    private Projeto loadProjeto(Long id) {
        return projetoRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projeto não encontrado."));
    }

    private void garantirLeitura(Projeto projeto, UsuarioAutenticado principal) {
        if (isAdministrativo(principal) || isSocio(principal)) {
            return;
        }
        if (isColaborador(principal) && projeto.getCriadoPor().getId().equals(principal.id())) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado ao contrato deste projeto.");
    }

    private static void exigirAdministrativo(UsuarioAutenticado principal) {
        if (!isAdministrativo(principal)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ação restrita ao perfil administrativo.");
        }
    }

    private static boolean isAdministrativo(UsuarioAutenticado principal) {
        return hasRole(principal, "ROLE_ADMINISTRATIVO");
    }

    private static boolean isSocio(UsuarioAutenticado principal) {
        return hasRole(principal, "ROLE_SOCIO");
    }

    private static boolean isColaborador(UsuarioAutenticado principal) {
        return hasRole(principal, "ROLE_COLABORADOR");
    }

    private static boolean hasRole(UsuarioAutenticado principal, String role) {
        for (GrantedAuthority authority : principal.getAuthorities()) {
            if (role.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    ContratoResponse toResponse(Contrato c) {
        return new ContratoResponse(
                c.getId(),
                c.getProjeto().getId(),
                c.getStatus(),
                c.getElaboradoPor().getId(),
                c.getElaboradoPor().getNome(),
                c.getEnviadoClienteEm(),
                c.getAceitoClienteEm(),
                c.getRecusadoClienteEm(),
                c.isConsideracoesPendentes(),
                c.getCriadoEm(),
                c.getAtualizadoEm());
    }

    private static ResponseStatusException badRequest(String msg) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }
}
