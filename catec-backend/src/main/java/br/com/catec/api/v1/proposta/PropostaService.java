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
import br.com.catec.security.AuthorizationService;
import br.com.catec.security.PermissaoCodigo;
import br.com.catec.security.UsuarioAutenticado;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PropostaService {

    private static final EnumSet<PropostaStatus> STATUS_PROPOSTA_ATIVA = EnumSet.of(
            PropostaStatus.RASCUNHO, PropostaStatus.PENDENTE_AVALIACAO);

    private static final EnumSet<PropostaStatus> STATUS_UPLOAD_DOCUMENTO = EnumSet.of(
            PropostaStatus.RASCUNHO, PropostaStatus.PENDENTE_AVALIACAO, PropostaStatus.AGUARDANDO_AJUSTE);

    private static final EnumSet<PropostaStatus> STATUS_PROPOSTA_REFERENCIA_STATUS_PROJETO = EnumSet.of(
            PropostaStatus.RASCUNHO,
            PropostaStatus.PENDENTE_AVALIACAO,
            PropostaStatus.AGUARDANDO_AJUSTE,
            PropostaStatus.ENVIADA_AO_CLIENTE,
            PropostaStatus.ACEITA,
            PropostaStatus.NEGADA);

    private static final EnumSet<ProjetoStatus> STATUS_PROJETO_SINCRONIZAVEL_PROPOSTA = EnumSet.of(
            ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL,
            ProjetoStatus.ELABORANDO_PROPOSTA,
            ProjetoStatus.AGUARDANDO_REVISAO_PROPOSTA,
            ProjetoStatus.AGUARDANDO_AJUSTE,
            ProjetoStatus.AGUARDANDO_ENVIO_CLIENTE,
            ProjetoStatus.AGUARDANDO_ACEITE_PROPOSTA);

    private final PropostaRepository propostaRepository;
    private final ProjetoRepository projetoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;
    private final DocumentoService documentoService;
    private final SocioPropostaNotificacaoService socioPropostaNotificacaoService;
    private final AuthorizationService authz;

    public PropostaService(
            PropostaRepository propostaRepository,
            ProjetoRepository projetoRepository,
            UsuarioRepository usuarioRepository,
            AuditoriaService auditoriaService,
            DocumentoService documentoService,
            SocioPropostaNotificacaoService socioPropostaNotificacaoService,
            AuthorizationService authz) {
        this.propostaRepository = propostaRepository;
        this.projetoRepository = projetoRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
        this.documentoService = documentoService;
        this.socioPropostaNotificacaoService = socioPropostaNotificacaoService;
        this.authz = authz;
    }

    @Transactional
    public PropostaResponse criar(Long projetoId, UsuarioAutenticado principal) {
        authz.require(principal, PermissaoCodigo.ACAO_PROPOSTA_CRIAR);
        Projeto projeto = loadProjeto(projetoId);
        validarProjetoParaNovaProposta(projetoId, projeto);

        if (propostaRepository.existsByProjetoIdAndStatusIn(projetoId, STATUS_PROPOSTA_ATIVA)) {
            throw badRequest("Já existe uma proposta em elaboração ou aprovação para este projeto.");
        }

        Instant agora = Instant.now();
        Usuario elaborador = usuarioRepository.getReferenceById(principal.id());

        Proposta proposta = new Proposta();
        proposta.setProjeto(projeto);
        proposta.setStatus(PropostaStatus.RASCUNHO);
        proposta.setVersao(propostaRepository.findMaxVersaoByProjetoId(projetoId) + 1);
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

        if (projeto.getStatus() == ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL
                || projeto.getStatus() == ProjetoStatus.AGUARDANDO_ACEITE_PROPOSTA
                || projeto.getStatus() == ProjetoStatus.AGUARDANDO_AJUSTE) {
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
        authz.require(principal, PermissaoCodigo.TELA_SOCIO_PROPOSTAS);
        return propostaRepository
                .findByStatusOrderByCriadoEmAsc(PropostaStatus.PENDENTE_AVALIACAO)
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

    @Transactional
    public List<PropostaResponse> listarPorProjeto(Long projetoId, UsuarioAutenticado principal) {
        Projeto projeto = loadProjeto(projetoId);
        garantirLeitura(projeto, principal);
        List<Proposta> propostas = propostaRepository.findByProjetoIdOrderByVersaoDesc(projetoId);
        reconciliarStatusProjetoComProposta(projeto, propostas, principal.id());
        return propostas.stream().map(this::toResponse).toList();
    }

    /** RASCUNHO → PENDENTE_AVALIACAO (quando exige avaliação do sócio). */
    @Transactional(readOnly = true)
    public List<DocumentoResponse> listarDocumentos(
            Long projetoId, Long propostaId, UsuarioAutenticado principal) {
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        garantirLeitura(proposta.getProjeto(), principal);
        return documentoService.listarPorVinculo(TipoVinculoDocumento.PROPOSTA, propostaId, principal);
    }

    @Transactional
    public DocumentoResponse uploadDocumentoNoFluxo(
            Long projetoId, String tipoArquivo, MultipartFile file, UsuarioAutenticado principal) {
        Proposta proposta = resolverPropostaParaUpload(projetoId, principal);
        return uploadDocumento(projetoId, proposta.getId(), tipoArquivo, file, principal);
    }

    @Transactional
    public DocumentoResponse uploadDocumento(
            Long projetoId,
            Long propostaId,
            String tipoArquivo,
            MultipartFile file,
            UsuarioAutenticado principal) {
        authz.require(principal, PermissaoCodigo.ACAO_DOCUMENTO_UPLOAD);
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        garantirUploadDocumento(proposta);
        if (proposta.getStatus() == PropostaStatus.RASCUNHO) {
            if (proposta.getAvaliadaSocioEm() != null) {
                throw badRequest("Proposta já aprovada pelo sócio; envie ao cliente.");
            }
            var uploaded =
                    documentoService.uploadPropostaSubstituindo(propostaId, tipoArquivo, file, principal);
            sincronizarProjetoSeElaboracao(proposta.getProjeto(), principal.id());
            return uploaded;
        }
        if (proposta.getStatus() == PropostaStatus.AGUARDANDO_AJUSTE) {
            var uploaded = documentoService.uploadPropostaSubstituindo(propostaId, tipoArquivo, file, principal);
            sincronizarProjetoSeElaboracao(proposta.getProjeto(), principal.id());
            return uploaded;
        }
        var uploaded = documentoService.uploadProposta(propostaId, tipoArquivo, file, principal);
        sincronizarProjetoSeElaboracao(proposta.getProjeto(), principal.id());
        return uploaded;
    }

    private void sincronizarProjetoSeElaboracao(Projeto projeto, Long usuarioId) {
        if (projeto.getStatus() == ProjetoStatus.AGUARDANDO_PROPOSTA_COMERCIAL
                || projeto.getStatus() == ProjetoStatus.AGUARDANDO_AJUSTE) {
            sincronizarProjeto(projeto, ProjetoStatus.ELABORANDO_PROPOSTA, usuarioId);
        }
    }

    @Transactional
    public PropostaResponse submeterParaAvaliacaoSocio(
            Long projetoId, Long propostaId, UsuarioAutenticado principal) {
        authz.require(principal, PermissaoCodigo.ACAO_PROPOSTA_EDITAR);
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        proposta.setAvaliadaSocioEm(null);
        proposta.setAvaliadaPorSocio(null);
        Proposta salva =
                transicionar(proposta, PropostaStatus.PENDENTE_AVALIACAO, "SUBMETER_AVALIACAO_SOCIO", principal);
        salva.setParecerSocio(null);
        salva = propostaRepository.save(salva);
        sincronizarProjeto(salva.getProjeto(), ProjetoStatus.AGUARDANDO_REVISAO_PROPOSTA, principal.id());
        socioPropostaNotificacaoService.propostaSubmetidaParaAvaliacaoSocio(
                salva.getId(), salva.getProjeto().getId(), salva.getProjeto().getTitulo());
        return toResponse(salva);
    }

    /** PENDENTE_AVALIACAO → RASCUNHO (parecer positivo do sócio). */
    @Transactional
    public PropostaResponse aprovarPeloSocio(Long projetoId, Long propostaId, UsuarioAutenticado principal) {
        return aprovarPeloSocio(projetoId, propostaId, null, principal);
    }

    @Transactional
    public PropostaResponse aprovarPeloSocio(
            Long projetoId, Long propostaId, String observacao, UsuarioAutenticado principal) {
        authz.require(principal, PermissaoCodigo.ACAO_SOCIO_PROPOSTA_APROVAR);
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        validarPendenteAvaliacaoSocio(proposta);
        Proposta salva = transicionar(
                proposta,
                PropostaStatus.RASCUNHO,
                "APROVAR_SOCIO",
                principal,
                payloadObservacao(observacao));
        salva.setAvaliadaSocioEm(Instant.now());
        salva.setAvaliadaPorSocio(usuarioRepository.getReferenceById(principal.id()));
        salva = propostaRepository.save(salva);
        sincronizarProjeto(salva.getProjeto(), ProjetoStatus.AGUARDANDO_ENVIO_CLIENTE, principal.id());
        socioPropostaNotificacaoService.propostaAprovadaPeloSocio(salva.getId(), principal.id());
        return toResponse(salva);
    }

    /** PENDENTE_AVALIACAO → RASCUNHO (ajustes após parecer). */
    @Transactional
    public PropostaResponse devolverParaRascunho(Long projetoId, Long propostaId, UsuarioAutenticado principal) {
        return devolverParaRascunho(projetoId, propostaId, null, principal);
    }

    @Transactional
    public PropostaResponse devolverParaRascunho(
            Long projetoId, Long propostaId, String observacao, UsuarioAutenticado principal) {
        authz.require(principal, PermissaoCodigo.ACAO_SOCIO_PROPOSTA_DEVOLVER);
        if (!StringUtils.hasText(observacao)) {
            throw badRequest("Informe o parecer ao reprovar a proposta para elaboração.");
        }
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        validarPendenteAvaliacaoSocio(proposta);
        Proposta salva = transicionar(
                proposta,
                PropostaStatus.AGUARDANDO_AJUSTE,
                "REPROVAR_SOCIO",
                principal,
                payloadObservacao(observacao.trim()));
        salva.setParecerSocio(observacao.trim());
        salva.setAvaliadaSocioEm(null);
        salva.setAvaliadaPorSocio(null);
        salva = propostaRepository.save(salva);
        sincronizarProjeto(salva.getProjeto(), ProjetoStatus.AGUARDANDO_AJUSTE, principal.id());
        socioPropostaNotificacaoService.propostaDevolvidaPeloSocio(salva.getId(), principal.id(), observacao.trim());
        return toResponse(salva);
    }

    /** RASCUNHO → ENVIADA_AO_CLIENTE. */
    @Transactional
    public PropostaResponse enviarAoCliente(Long projetoId, Long propostaId, UsuarioAutenticado principal) {
        authz.require(principal, PermissaoCodigo.ACAO_PROPOSTA_ENVIAR_CLIENTE);
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        validarEnvioAoCliente(proposta);
        Instant agora = Instant.now();
        Proposta salva = transicionar(proposta, PropostaStatus.ENVIADA_AO_CLIENTE, "ENVIAR_CLIENTE", principal);
        salva.setEnviadaClienteEm(agora);
        salva.setCobrancaPropostaInicioEm(agora);
        salva = propostaRepository.save(salva);

        Projeto projeto = salva.getProjeto();
        if (projeto.getStatus() == ProjetoStatus.ELABORANDO_PROPOSTA
                || projeto.getStatus() == ProjetoStatus.AGUARDANDO_REVISAO_PROPOSTA
                || projeto.getStatus() == ProjetoStatus.AGUARDANDO_AJUSTE
                || projeto.getStatus() == ProjetoStatus.AGUARDANDO_ENVIO_CLIENTE) {
            sincronizarProjeto(projeto, ProjetoStatus.AGUARDANDO_ACEITE_PROPOSTA, principal.id());
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
        if (proposta.getStatus() != PropostaStatus.PENDENTE_AVALIACAO) {
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

    private void validarEnvioAoCliente(Proposta proposta) {
        if (proposta.getStatus() != PropostaStatus.RASCUNHO) {
            throw badRequest("Só é possível enviar ao cliente uma proposta em rascunho.");
        }
        if (proposta.getAvaliadaSocioEm() == null) {
            throw badRequest("Aguarde o parecer do sócio antes de enviar ao cliente.");
        }
    }

    private void validarTransicao(PropostaStatus atual, PropostaStatus novo, Proposta proposta) {
        boolean ok =
                switch (atual) {
                    case RASCUNHO ->
                            novo == PropostaStatus.PENDENTE_AVALIACAO
                                    || (novo == PropostaStatus.ENVIADA_AO_CLIENTE
                                            && proposta.getAvaliadaSocioEm() != null);
                    case AGUARDANDO_AJUSTE -> novo == PropostaStatus.PENDENTE_AVALIACAO;
                    case PENDENTE_AVALIACAO ->
                            novo == PropostaStatus.RASCUNHO || novo == PropostaStatus.AGUARDANDO_AJUSTE;
                    case ENVIADA_AO_CLIENTE, ACEITA, NEGADA -> false;
                };
        if (!ok) {
            throw badRequest(
                    "Transição de estado inválida da proposta: de %s para %s não é permitido."
                            .formatted(labelEstado(atual), labelEstado(novo)));
        }
    }

    private void validarProjetoParaNovaProposta(Long projetoId, Projeto projeto) {
        if (projeto.getStatus() == ProjetoStatus.PENDENTE_CLIENTE) {
            throw badRequest("Associe um cliente ao projeto antes de criar a proposta comercial.");
        }
        if (existePendenciaRevisaoProposta(projetoId)) {
            return;
        }
        if (projeto.getStatus() == ProjetoStatus.AGUARDANDO_ACEITE_PROPOSTA) {
            throw badRequest("Projeto já possui proposta comercial aguardando resposta do cliente.");
        }
        if (projeto.getStatus() == ProjetoStatus.AGUARDANDO_CONTRATO
                || projeto.getStatus() == ProjetoStatus.AGUARDANDO_EXECUCAO
                || projeto.getStatus() == ProjetoStatus.EM_EXECUCAO) {
            throw badRequest("Projeto com contrato em andamento ou em execução; não é possível criar nova proposta comercial.");
        }
        if (projeto.getStatus() == ProjetoStatus.CANCELADO) {
            throw badRequest("Projeto cancelado; não é possível criar nova proposta comercial.");
        }
        if (projeto.getStatus() == ProjetoStatus.FINALIZADO) {
            throw badRequest("Projeto finalizado; não é possível criar nova proposta comercial.");
        }
    }

    /** Cliente pediu ajustes: permite nova versão (v2+) mesmo com projeto aguardando aceite. */
    private boolean existePendenciaRevisaoProposta(Long projetoId) {
        return propostaRepository.existsByProjetoIdAndStatus(projetoId, PropostaStatus.AGUARDANDO_AJUSTE)
                || propostaRepository.existsByProjetoIdAndConsideracoesPendentesTrue(projetoId);
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

    private void reconciliarStatusProjetoComProposta(Projeto projeto, List<Proposta> propostas, Long usuarioId) {
        if (propostas.isEmpty() || !STATUS_PROJETO_SINCRONIZAVEL_PROPOSTA.contains(projeto.getStatus())) {
            return;
        }

        Proposta referencia = propostas.stream()
                .filter(p -> STATUS_PROPOSTA_REFERENCIA_STATUS_PROJETO.contains(p.getStatus()))
                .findFirst()
                .orElse(null);
        if (referencia == null) {
            return;
        }

        ProjetoStatus esperado = statusProjetoEsperadoParaProposta(referencia);
        if (esperado != null && projeto.getStatus() != esperado) {
            sincronizarProjeto(projeto, esperado, usuarioId);
        }
    }

    private ProjetoStatus statusProjetoEsperadoParaProposta(Proposta proposta) {
        return switch (proposta.getStatus()) {
            case RASCUNHO ->
                    proposta.getAvaliadaSocioEm() != null
                            ? ProjetoStatus.AGUARDANDO_ENVIO_CLIENTE
                            : ProjetoStatus.ELABORANDO_PROPOSTA;
            case PENDENTE_AVALIACAO -> ProjetoStatus.AGUARDANDO_REVISAO_PROPOSTA;
            case AGUARDANDO_AJUSTE -> ProjetoStatus.AGUARDANDO_AJUSTE;
            case ENVIADA_AO_CLIENTE -> ProjetoStatus.AGUARDANDO_ACEITE_PROPOSTA;
            case ACEITA -> ProjetoStatus.AGUARDANDO_CONTRATO;
            case NEGADA -> ProjetoStatus.CANCELADO;
        };
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

    private Proposta resolverPropostaParaUpload(Long projetoId, UsuarioAutenticado principal) {
        Projeto projeto = loadProjeto(projetoId);
        garantirLeitura(projeto, principal);

        var existente = propostaRepository.findFirstByProjetoIdAndStatusInOrderByVersaoDesc(
                projetoId, STATUS_UPLOAD_DOCUMENTO);
        if (existente.isPresent()) {
            return existente.get();
        }

        validarProjetoParaNovaProposta(projetoId, projeto);
        if (propostaRepository.existsByProjetoIdAndStatusIn(projetoId, STATUS_PROPOSTA_ATIVA)) {
            throw badRequest("Não é possível anexar documentos no estado atual da proposta.");
        }

        return loadProposta(criar(projetoId, principal).id());
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
        if (!authz.podeLerProjeto(principal, projeto.getCriadoPor().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a propostas deste projeto.");
        }
    }

    private static String labelEstado(PropostaStatus status) {
        return switch (status) {
            case RASCUNHO -> "Em elaboração";
            case PENDENTE_AVALIACAO -> "Pendente avaliação";
            case ENVIADA_AO_CLIENTE -> "Enviada ao cliente";
            case AGUARDANDO_AJUSTE -> "Aguardando ajuste";
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
                p.getElaboradoPor().getId(),
                p.getElaboradoPor().getNome(),
                p.getEnviadaClienteEm(),
                p.getAvaliadaSocioEm(),
                p.getAvaliadaPorSocio() != null ? p.getAvaliadaPorSocio().getId() : null,
                p.isConsideracoesPendentes(),
                p.getParecerSocio(),
                p.getCobrancaPropostaInicioEm(),
                p.getCriadoEm(),
                p.getAtualizadoEm());
    }

    private static ResponseStatusException badRequest(String msg) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }
}
