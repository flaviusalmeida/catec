package br.com.catec.api.v1.proposta;

import br.com.catec.api.v1.documento.DocumentoResponse;
import br.com.catec.api.v1.documento.DocumentoService;
import br.com.catec.domain.auditoria.AuditoriaService;
import br.com.catec.domain.auditoria.TipoEntidadeAuditoria;
import br.com.catec.domain.documento.TipoVinculoDocumento;
import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.domain.proposta.Proposta;
import br.com.catec.domain.proposta.PropostaRepository;
import br.com.catec.domain.proposta.PropostaStatus;
import br.com.catec.domain.usuario.Usuario;
import br.com.catec.domain.usuario.UsuarioRepository;
import br.com.catec.security.UsuarioAutenticado;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PropostaService {

    private static final EnumSet<PropostaStatus> STATUS_PROPOSTA_ATIVA = EnumSet.of(
            PropostaStatus.RASCUNHO, PropostaStatus.PENDENTE_AVALIACAO_SOCIO, PropostaStatus.APROVADA_INTERNA);

    private static final EnumSet<PropostaStatus> STATUS_UPLOAD_DOCUMENTO = EnumSet.of(
            PropostaStatus.RASCUNHO, PropostaStatus.PENDENTE_AVALIACAO_SOCIO, PropostaStatus.APROVADA_INTERNA);

    private final PropostaRepository propostaRepository;
    private final ProjetoRepository projetoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;
    private final DocumentoService documentoService;
    private final SocioPropostaNotificacaoService socioPropostaNotificacaoService;

    public PropostaService(
            PropostaRepository propostaRepository,
            ProjetoRepository projetoRepository,
            UsuarioRepository usuarioRepository,
            AuditoriaService auditoriaService,
            DocumentoService documentoService,
            SocioPropostaNotificacaoService socioPropostaNotificacaoService) {
        this.propostaRepository = propostaRepository;
        this.projetoRepository = projetoRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
        this.documentoService = documentoService;
        this.socioPropostaNotificacaoService = socioPropostaNotificacaoService;
    }

    @Transactional
    public PropostaResponse criar(Long projetoId, boolean requerAvaliacaoSocio, UsuarioAutenticado principal) {
        exigirAdministrativo(principal);
        Projeto projeto = loadProjeto(projetoId);
        validarProjetoParaNovaProposta(projeto);

        if (propostaRepository.existsByProjetoIdAndStatusIn(projetoId, STATUS_PROPOSTA_ATIVA)) {
            throw badRequest("Já existe uma proposta em elaboração ou aprovação para este projeto.");
        }

        Instant agora = Instant.now();
        Usuario elaborador = usuarioRepository.getReferenceById(principal.id());

        Proposta proposta = new Proposta();
        proposta.setProjeto(projeto);
        proposta.setStatus(PropostaStatus.RASCUNHO);
        proposta.setVersao(propostaRepository.findMaxVersaoByProjetoId(projetoId) + 1);
        proposta.setRequerAvaliacaoSocio(requerAvaliacaoSocio);
        proposta.setElaboradoPor(elaborador);
        proposta.setConsideracoesPendentes(false);
        proposta.setCriadoEm(agora);
        proposta.setAtualizadoEm(agora);

        Proposta salva = propostaRepository.save(proposta);
        auditoriaService.registrarTransicaoStatus(
                TipoEntidadeAuditoria.PROPOSTA,
                salva.getId(),
                "CRIAR",
                null,
                PropostaStatus.RASCUNHO.name(),
                principal.id());

        if (projeto.getStatus() == ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL) {
            sincronizarProjeto(projeto, ProjetoStatus.ELABORANDO_PROPOSTA, principal.id());
        }

        return toResponse(salva);
    }

    @Transactional(readOnly = true)
    public PropostaResponse obter(Long projetoId, Long propostaId, UsuarioAutenticado principal) {
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        garantirLeitura(proposta.getProjeto(), principal);
        return toResponse(proposta);
    }

    @Transactional(readOnly = true)
    public List<PropostaPendenteSocioResponse> listarPendentesSocio(UsuarioAutenticado principal) {
        exigirSocio(principal);
        return propostaRepository
                .findByStatusAndRequerAvaliacaoSocioTrueOrderByCriadoEmAsc(PropostaStatus.PENDENTE_AVALIACAO_SOCIO)
                .stream()
                .map(p -> new PropostaPendenteSocioResponse(
                        p.getId(),
                        p.getProjeto().getId(),
                        p.getProjeto().getTitulo(),
                        p.getProjeto().getCliente() != null ? p.getProjeto().getCliente().getRazaoSocialOuNome() : null,
                        p.getVersao(),
                        p.getElaboradoPor().getNome(),
                        p.getCriadoEm()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PropostaResponse> listarPorProjeto(Long projetoId, UsuarioAutenticado principal) {
        Projeto projeto = loadProjeto(projetoId);
        garantirLeitura(projeto, principal);
        return propostaRepository.findByProjetoIdOrderByVersaoDesc(projetoId).stream()
                .map(this::toResponse)
                .toList();
    }

    /** RASCUNHO → PENDENTE_AVALIACAO_SOCIO (quando exige avaliação do sócio). */
    @Transactional(readOnly = true)
    public List<DocumentoResponse> listarDocumentos(
            Long projetoId, Long propostaId, UsuarioAutenticado principal) {
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        garantirLeitura(proposta.getProjeto(), principal);
        return documentoService.listarPorVinculo(TipoVinculoDocumento.PROPOSTA, propostaId, principal);
    }

    @Transactional
    public DocumentoResponse uploadDocumento(
            Long projetoId,
            Long propostaId,
            String tipoArquivo,
            MultipartFile file,
            UsuarioAutenticado principal) {
        exigirAdministrativo(principal);
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        garantirUploadDocumento(proposta);
        return documentoService.uploadProposta(propostaId, tipoArquivo, file, principal);
    }

    @Transactional
    public PropostaResponse submeterParaAvaliacaoSocio(
            Long projetoId, Long propostaId, UsuarioAutenticado principal) {
        exigirAdministrativo(principal);
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        if (!proposta.isRequerAvaliacaoSocio()) {
            throw badRequest("Esta proposta não requer avaliação do sócio. Use aprovação interna direta.");
        }
        Proposta salva =
                transicionar(proposta, PropostaStatus.PENDENTE_AVALIACAO_SOCIO, "SUBMETER_AVALIACAO_SOCIO", principal);
        socioPropostaNotificacaoService.propostaSubmetidaParaAvaliacaoSocio(
                salva.getId(), salva.getProjeto().getId(), salva.getProjeto().getTitulo());
        return toResponse(salva);
    }

    /** RASCUNHO → APROVADA_INTERNA (sem gate de sócio). */
    @Transactional
    public PropostaResponse aprovarInternamenteSemSocio(
            Long projetoId, Long propostaId, UsuarioAutenticado principal) {
        exigirAdministrativo(principal);
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        if (proposta.isRequerAvaliacaoSocio()) {
            throw badRequest("Proposta marcada para avaliação do sócio. Submeta e aguarde parecer.");
        }
        return toResponse(transicionar(proposta, PropostaStatus.APROVADA_INTERNA, "APROVAR_INTERNA_SEM_SOCIO", principal));
    }

    /** PENDENTE_AVALIACAO_SOCIO → APROVADA_INTERNA. */
    @Transactional
    public PropostaResponse aprovarPeloSocio(Long projetoId, Long propostaId, UsuarioAutenticado principal) {
        return aprovarPeloSocio(projetoId, propostaId, null, principal);
    }

    @Transactional
    public PropostaResponse aprovarPeloSocio(
            Long projetoId, Long propostaId, String observacao, UsuarioAutenticado principal) {
        exigirSocio(principal);
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        validarPendenteAvaliacaoSocio(proposta);
        Proposta salva = transicionar(
                proposta,
                PropostaStatus.APROVADA_INTERNA,
                "APROVAR_SOCIO",
                principal,
                payloadObservacao(observacao));
        salva.setAvaliadaSocioEm(Instant.now());
        salva.setAvaliadaPorSocio(usuarioRepository.getReferenceById(principal.id()));
        salva = propostaRepository.save(salva);
        socioPropostaNotificacaoService.propostaAprovadaPeloSocio(salva.getId(), principal.id());
        return toResponse(salva);
    }

    /** PENDENTE_AVALIACAO_SOCIO → RASCUNHO (ajustes após parecer). */
    @Transactional
    public PropostaResponse devolverParaRascunho(Long projetoId, Long propostaId, UsuarioAutenticado principal) {
        return devolverParaRascunho(projetoId, propostaId, null, principal);
    }

    @Transactional
    public PropostaResponse devolverParaRascunho(
            Long projetoId, Long propostaId, String observacao, UsuarioAutenticado principal) {
        exigirSocio(principal);
        if (!StringUtils.hasText(observacao)) {
            throw badRequest("Informe o parecer ao devolver a proposta para rascunho.");
        }
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        validarPendenteAvaliacaoSocio(proposta);
        Proposta salva = transicionar(
                proposta,
                PropostaStatus.RASCUNHO,
                "DEVOLVER_RASCUNHO_SOCIO",
                principal,
                payloadObservacao(observacao.trim()));
        socioPropostaNotificacaoService.propostaDevolvidaPeloSocio(salva.getId(), principal.id(), observacao.trim());
        return toResponse(salva);
    }

    /** APROVADA_INTERNA → ENVIADA_AO_CLIENTE. */
    @Transactional
    public PropostaResponse enviarAoCliente(Long projetoId, Long propostaId, UsuarioAutenticado principal) {
        exigirAdministrativo(principal);
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        Instant agora = Instant.now();
        Proposta salva = transicionar(proposta, PropostaStatus.ENVIADA_AO_CLIENTE, "ENVIAR_CLIENTE", principal);
        salva.setEnviadaClienteEm(agora);
        salva.setCobrancaPropostaInicioEm(agora);
        salva = propostaRepository.save(salva);

        Projeto projeto = salva.getProjeto();
        if (projeto.getStatus() == ProjetoStatus.ELABORANDO_PROPOSTA) {
            sincronizarProjeto(projeto, ProjetoStatus.PROPOSTA_CONCLUIDA, principal.id());
        }

        return toResponse(salva);
    }

    private Proposta transicionar(
            Proposta proposta, PropostaStatus novoStatus, String acao, UsuarioAutenticado principal) {
        return transicionar(proposta, novoStatus, acao, principal, null);
    }

    private Proposta transicionar(
            Proposta proposta,
            PropostaStatus novoStatus,
            String acao,
            UsuarioAutenticado principal,
            String payloadJson) {
        PropostaStatus anterior = proposta.getStatus();
        validarTransicao(anterior, novoStatus, proposta);
        proposta.setStatus(novoStatus);
        proposta.setAtualizadoEm(Instant.now());
        Proposta salva = propostaRepository.save(proposta);
        auditoriaService.registrar(
                TipoEntidadeAuditoria.PROPOSTA,
                salva.getId(),
                acao,
                anterior.name(),
                novoStatus.name(),
                principal.id(),
                payloadJson);
        return salva;
    }

    private void validarPendenteAvaliacaoSocio(Proposta proposta) {
        if (!proposta.isRequerAvaliacaoSocio()) {
            throw badRequest("Esta proposta não está no fluxo de avaliação do sócio.");
        }
        if (proposta.getStatus() != PropostaStatus.PENDENTE_AVALIACAO_SOCIO) {
            throw badRequest("Avaliação do sócio só é permitida com proposta pendente de parecer.");
        }
    }

    private static String payloadObservacao(String observacao) {
        if (!StringUtils.hasText(observacao)) {
            return null;
        }
        String esc = observacao
                .trim()
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "")
                .replace("\n", "\\n");
        return "{\"observacao\":\"" + esc + "\"}";
    }

    private void validarTransicao(PropostaStatus atual, PropostaStatus novo, Proposta proposta) {
        boolean ok =
                switch (atual) {
                    case RASCUNHO -> novo == PropostaStatus.PENDENTE_AVALIACAO_SOCIO
                            || (novo == PropostaStatus.APROVADA_INTERNA && !proposta.isRequerAvaliacaoSocio());
                    case PENDENTE_AVALIACAO_SOCIO -> novo == PropostaStatus.APROVADA_INTERNA
                            || novo == PropostaStatus.RASCUNHO;
                    case APROVADA_INTERNA -> novo == PropostaStatus.ENVIADA_AO_CLIENTE;
                    case ENVIADA_AO_CLIENTE,
                            EM_AVALIACAO_CLIENTE,
                            AGUARDANDO_AJUSTE_ADM,
                            ACEITA,
                            NEGADA -> false;
                };
        if (!ok) {
            throw badRequest(
                    "Transição de estado inválida da proposta: de %s para %s não é permitido."
                            .formatted(labelEstado(atual), labelEstado(novo)));
        }
    }

    private void validarProjetoParaNovaProposta(Projeto projeto) {
        if (projeto.getStatus() == ProjetoStatus.PENDENTE_CLIENTE) {
            throw badRequest("Associe um cliente ao projeto antes de criar a proposta comercial.");
        }
        if (projeto.getStatus() == ProjetoStatus.PROPOSTA_CONCLUIDA) {
            throw badRequest("Projeto já possui proposta comercial concluída neste ciclo.");
        }
    }

    private void sincronizarProjeto(Projeto projeto, ProjetoStatus novoStatus, Long usuarioId) {
        ProjetoStatus anterior = projeto.getStatus();
        if (anterior == novoStatus) {
            return;
        }
        projeto.setStatus(novoStatus);
        projeto.setAtualizadoEm(Instant.now());
        projetoRepository.save(projeto);
        auditoriaService.registrarTransicaoStatus(
                TipoEntidadeAuditoria.PROJETO,
                projeto.getId(),
                "SINCRONIZAR_PROPOSTA",
                anterior.name(),
                novoStatus.name(),
                usuarioId);
    }

    private Proposta loadProposta(Long id) {
        return propostaRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposta não encontrada."));
    }

    private Proposta loadPropostaDoProjeto(Long projetoId, Long propostaId) {
        Proposta proposta = loadProposta(propostaId);
        if (!proposta.getProjeto().getId().equals(projetoId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposta não encontrada neste projeto.");
        }
        return proposta;
    }

    private void garantirUploadDocumento(Proposta proposta) {
        if (!STATUS_UPLOAD_DOCUMENTO.contains(proposta.getStatus())) {
            throw badRequest("Não é possível anexar documentos no estado atual da proposta.");
        }
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
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a propostas deste projeto.");
    }

    private static void exigirAdministrativo(UsuarioAutenticado principal) {
        if (!isAdministrativo(principal)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ação restrita ao perfil administrativo.");
        }
    }

    private static void exigirSocio(UsuarioAutenticado principal) {
        if (!isSocio(principal)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ação restrita ao perfil sócio.");
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

    private static String labelEstado(PropostaStatus status) {
        return switch (status) {
            case RASCUNHO -> "Rascunho";
            case PENDENTE_AVALIACAO_SOCIO -> "Pendente avaliação sócio";
            case APROVADA_INTERNA -> "Aprovada internamente";
            case ENVIADA_AO_CLIENTE -> "Enviada ao cliente";
            case EM_AVALIACAO_CLIENTE -> "Em avaliação do cliente";
            case AGUARDANDO_AJUSTE_ADM -> "Aguardando ajuste ADM";
            case ACEITA -> "Aceita";
            case NEGADA -> "Negada";
        };
    }

    private PropostaResponse toResponse(Proposta p) {
        return new PropostaResponse(
                p.getId(),
                p.getProjeto().getId(),
                p.getStatus(),
                p.getVersao(),
                p.isRequerAvaliacaoSocio(),
                p.getElaboradoPor().getId(),
                p.getElaboradoPor().getNome(),
                p.getEnviadaClienteEm(),
                p.getAvaliadaSocioEm(),
                p.getAvaliadaPorSocio() != null ? p.getAvaliadaPorSocio().getId() : null,
                p.isConsideracoesPendentes(),
                p.getCobrancaPropostaInicioEm(),
                p.getCriadoEm(),
                p.getAtualizadoEm());
    }

    private static ResponseStatusException badRequest(String msg) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }
}
