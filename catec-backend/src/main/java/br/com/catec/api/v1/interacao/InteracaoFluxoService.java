package br.com.catec.api.v1.interacao;

import br.com.catec.api.v1.contrato.ContratoResponse;
import br.com.catec.api.v1.proposta.PropostaResponse;
import br.com.catec.domain.auditoria.AuditoriaService;
import br.com.catec.domain.contrato.Contrato;
import br.com.catec.domain.contrato.ContratoRepository;
import br.com.catec.domain.contrato.ContratoStatus;
import br.com.catec.domain.auditoria.TipoEntidadeAuditoria;
import br.com.catec.domain.documento.Documento;
import br.com.catec.domain.documento.DocumentoRepository;
import br.com.catec.domain.documento.TipoVinculoDocumento;
import br.com.catec.domain.interacao.InteracaoFluxo;
import br.com.catec.domain.interacao.InteracaoFluxoRepository;
import br.com.catec.domain.interacao.TipoEntidadeInteracao;
import br.com.catec.domain.interacao.TipoInteracaoFluxo;
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
import org.springframework.web.server.ResponseStatusException;

@Service
public class InteracaoFluxoService {

    private static final EnumSet<PropostaStatus> STATUS_RESPOSTA_CLIENTE = EnumSet.of(
            PropostaStatus.ENVIADA_AO_CLIENTE,
            PropostaStatus.EM_AVALIACAO_CLIENTE,
            PropostaStatus.AGUARDANDO_AJUSTE);

    private static final EnumSet<ContratoStatus> STATUS_INTERACAO_CLIENTE_CONTRATO = EnumSet.of(
            ContratoStatus.ENVIADO_AO_CLIENTE, ContratoStatus.AGUARDANDO_AJUSTE);

    private final InteracaoFluxoRepository interacaoFluxoRepository;
    private final PropostaRepository propostaRepository;
    private final ContratoRepository contratoRepository;
    private final ProjetoRepository projetoRepository;
    private final DocumentoRepository documentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;
    private final AuthorizationService authz;

    public InteracaoFluxoService(
            InteracaoFluxoRepository interacaoFluxoRepository,
            PropostaRepository propostaRepository,
            ContratoRepository contratoRepository,
            ProjetoRepository projetoRepository,
            DocumentoRepository documentoRepository,
            UsuarioRepository usuarioRepository,
            AuditoriaService auditoriaService,
            AuthorizationService authz) {
        this.interacaoFluxoRepository = interacaoFluxoRepository;
        this.propostaRepository = propostaRepository;
        this.contratoRepository = contratoRepository;
        this.projetoRepository = projetoRepository;
        this.documentoRepository = documentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
        this.authz = authz;
    }

    @Transactional(readOnly = true)
    public List<InteracaoFluxoResponse> listarPorProposta(
            Long projetoId, Long propostaId, UsuarioAutenticado principal) {
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        garantirLeituraProposta(proposta, principal);
        return interacaoFluxoRepository
                .findByTipoEntidadeAndEntidadeIdOrderByCriadoEmDesc(TipoEntidadeInteracao.PROPOSTA, propostaId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RegistroInteracaoResult registrarRespostaCliente(
            Long projetoId, Long propostaId, InteracaoFluxoCreateRequest request, UsuarioAutenticado principal) {
        authz.require(principal, PermissaoCodigo.ACAO_INTERACAO_REGISTRAR);
        Proposta proposta = loadPropostaDoProjeto(projetoId, propostaId);
        String texto = request.texto().trim();
        if (!StringUtils.hasText(texto)) {
            throw badRequest("Informe o texto da interação.");
        }

        Documento documento = resolverDocumentoOpcional(request.documentoId(), propostaId);

        PropostaStatus novoStatus = aplicarTransicaoPorTipo(proposta, request.tipoInteracao());
        PropostaStatus anterior = proposta.getStatus();
        Instant agora = Instant.now();

        proposta.setStatus(novoStatus);
        proposta.setAtualizadoEm(agora);
        switch (request.tipoInteracao()) {
            case CONSIDERACOES_CLIENTE -> proposta.setConsideracoesPendentes(true);
            case ACEITE_CLIENTE -> {
                proposta.setAceitaClienteEm(agora);
                proposta.setConsideracoesPendentes(false);
            }
            case RECUSA_CLIENTE -> {
                proposta.setNegadaClienteEm(agora);
                proposta.setMotivoNegativaCliente(texto);
                proposta.setConsideracoesPendentes(false);
            }
        }

        Proposta salva = propostaRepository.save(proposta);

        Usuario registrador = usuarioRepository.getReferenceById(principal.id());
        InteracaoFluxo interacao = new InteracaoFluxo();
        interacao.setTipoEntidade(TipoEntidadeInteracao.PROPOSTA);
        interacao.setEntidadeId(propostaId);
        interacao.setTipoInteracao(request.tipoInteracao());
        interacao.setTexto(texto);
        interacao.setRegistradoPor(registrador);
        interacao.setDocumento(documento);
        interacao.setCriadoEm(agora);
        InteracaoFluxo salvaInteracao = interacaoFluxoRepository.save(interacao);

        auditoriaService.registrarTransicaoStatus(
                TipoEntidadeAuditoria.PROPOSTA,
                salva.getId(),
                "REGISTRO_" + request.tipoInteracao().name(),
                anterior.name(),
                novoStatus.name(),
                principal.id());

        if (novoStatus == PropostaStatus.NEGADA) {
            sincronizarProjeto(salva.getProjeto(), ProjetoStatus.CANCELADO, "PROPOSTA_NEGADA_CLIENTE", principal.id());
        } else if (novoStatus == PropostaStatus.ACEITA) {
            sincronizarProjeto(
                    salva.getProjeto(), ProjetoStatus.AGUARDANDO_CONTRATO, "PROPOSTA_ACEITA_CLIENTE", principal.id());
        }

        return new RegistroInteracaoResult(toResponse(salvaInteracao), toPropostaResponse(salva));
    }

    @Transactional(readOnly = true)
    public List<InteracaoFluxoResponse> listarPorContrato(
            Long projetoId, Long contratoId, UsuarioAutenticado principal) {
        Contrato contrato = loadContratoDoProjeto(projetoId, contratoId);
        garantirLeituraContrato(contrato, principal);
        return interacaoFluxoRepository
                .findByTipoEntidadeAndEntidadeIdOrderByCriadoEmDesc(TipoEntidadeInteracao.CONTRATO, contratoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RegistroInteracaoContratoResult registrarInteracaoClienteContrato(
            Long projetoId, Long contratoId, InteracaoFluxoCreateRequest request, UsuarioAutenticado principal) {
        authz.require(principal, PermissaoCodigo.ACAO_INTERACAO_REGISTRAR);
        Contrato contrato = loadContratoDoProjeto(projetoId, contratoId);
        String texto = request.texto().trim();
        if (!StringUtils.hasText(texto)) {
            throw badRequest("Informe o texto da interação.");
        }

        Documento documento = resolverDocumentoOpcionalContrato(request.documentoId(), contratoId);

        ContratoStatus novoStatus = aplicarTransicaoContratoPorTipo(contrato, request.tipoInteracao());
        ContratoStatus anterior = contrato.getStatus();
        Instant agora = Instant.now();

        contrato.setStatus(novoStatus);
        contrato.setAtualizadoEm(agora);
        switch (request.tipoInteracao()) {
            case CONSIDERACOES_CLIENTE -> contrato.setConsideracoesPendentes(true);
            case ACEITE_CLIENTE -> {
                contrato.setAceitoClienteEm(agora);
                contrato.setConsideracoesPendentes(false);
            }
            case RECUSA_CLIENTE -> {
                contrato.setRecusadoClienteEm(agora);
                contrato.setMotivoRecusaCliente(texto);
                contrato.setConsideracoesPendentes(false);
            }
        }

        Contrato salvo = contratoRepository.save(contrato);

        Usuario registrador = usuarioRepository.getReferenceById(principal.id());
        InteracaoFluxo interacao = new InteracaoFluxo();
        interacao.setTipoEntidade(TipoEntidadeInteracao.CONTRATO);
        interacao.setEntidadeId(contratoId);
        interacao.setTipoInteracao(request.tipoInteracao());
        interacao.setTexto(texto);
        interacao.setRegistradoPor(registrador);
        interacao.setDocumento(documento);
        interacao.setCriadoEm(agora);
        InteracaoFluxo salvaInteracao = interacaoFluxoRepository.save(interacao);

        auditoriaService.registrarTransicaoStatus(
                TipoEntidadeAuditoria.CONTRATO,
                salvo.getId(),
                "REGISTRO_" + request.tipoInteracao().name(),
                anterior.name(),
                novoStatus.name(),
                principal.id());

        if (novoStatus == ContratoStatus.RECUSADO) {
            sincronizarProjeto(salvo.getProjeto(), ProjetoStatus.CANCELADO, "CONTRATO_RECUSADO_CLIENTE", principal.id());
        } else if (novoStatus == ContratoStatus.ACEITO) {
            sincronizarProjeto(salvo.getProjeto(), ProjetoStatus.AGUARDANDO_EXECUCAO, "CONTRATO_ACEITO_CLIENTE", principal.id());
        }

        return new RegistroInteracaoContratoResult(toResponse(salvaInteracao), toContratoResponse(salvo));
    }

    private void sincronizarProjeto(Projeto projeto, ProjetoStatus novoStatus, String evento, Long usuarioId) {
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
                evento,
                anterior.name(),
                novoStatus.name(),
                usuarioId);
    }

    private PropostaStatus aplicarTransicaoPorTipo(Proposta proposta, TipoInteracaoFluxo tipo) {
        PropostaStatus atual = proposta.getStatus();
        return switch (tipo) {
            case CONSIDERACOES_CLIENTE -> {
                if (atual != PropostaStatus.ENVIADA_AO_CLIENTE && atual != PropostaStatus.EM_AVALIACAO_CLIENTE) {
                    throw badRequest("Considerações do cliente só podem ser registradas após o envio da proposta.");
                }
                yield PropostaStatus.AGUARDANDO_AJUSTE;
            }
            case ACEITE_CLIENTE -> {
                if (!STATUS_RESPOSTA_CLIENTE.contains(atual)) {
                    throw badRequest("Aceite do cliente não é permitido no estado atual da proposta.");
                }
                yield PropostaStatus.ACEITA;
            }
            case RECUSA_CLIENTE -> {
                if (!STATUS_RESPOSTA_CLIENTE.contains(atual)) {
                    throw badRequest("Recusa do cliente não é permitida no estado atual da proposta.");
                }
                yield PropostaStatus.NEGADA;
            }
        };
    }

    private ContratoStatus aplicarTransicaoContratoPorTipo(Contrato contrato, TipoInteracaoFluxo tipo) {
        ContratoStatus atual = contrato.getStatus();
        return switch (tipo) {
            case CONSIDERACOES_CLIENTE -> {
                if (atual != ContratoStatus.ENVIADO_AO_CLIENTE) {
                    throw badRequest("Considerações do cliente só podem ser registradas após o envio do contrato.");
                }
                yield ContratoStatus.AGUARDANDO_AJUSTE;
            }
            case ACEITE_CLIENTE -> {
                if (!STATUS_INTERACAO_CLIENTE_CONTRATO.contains(atual)) {
                    throw badRequest("Aceite do cliente não é permitido no estado atual do contrato.");
                }
                yield ContratoStatus.ACEITO;
            }
            case RECUSA_CLIENTE -> {
                if (!STATUS_INTERACAO_CLIENTE_CONTRATO.contains(atual)) {
                    throw badRequest("Recusa do cliente não é permitida no estado atual do contrato.");
                }
                yield ContratoStatus.RECUSADO;
            }
        };
    }

    private Documento resolverDocumentoOpcionalContrato(Long documentoId, Long contratoId) {
        if (documentoId == null) {
            return null;
        }
        Documento doc = documentoRepository
                .findById(documentoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Documento não encontrado."));
        if (doc.getTipoVinculo() != TipoVinculoDocumento.CONTRATO || !contratoId.equals(doc.getVinculoId())) {
            throw badRequest("Documento não pertence a este contrato.");
        }
        return doc;
    }

    private Contrato loadContratoDoProjeto(Long projetoId, Long contratoId) {
        Contrato contrato = contratoRepository
                .findById(contratoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado."));
        if (!contrato.getProjeto().getId().equals(projetoId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado neste projeto.");
        }
        return contrato;
    }

    private void garantirLeituraContrato(Contrato contrato, UsuarioAutenticado principal) {
        if (!authz.podeLerProjeto(principal, contrato.getProjeto().getCriadoPor().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a interações deste contrato.");
        }
    }

    private Documento resolverDocumentoOpcional(Long documentoId, Long propostaId) {
        if (documentoId == null) {
            return null;
        }
        Documento doc = documentoRepository
                .findById(documentoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Documento não encontrado."));
        if (doc.getTipoVinculo() != TipoVinculoDocumento.PROPOSTA || !propostaId.equals(doc.getVinculoId())) {
            throw badRequest("Documento não pertence a esta proposta.");
        }
        return doc;
    }

    private Proposta loadPropostaDoProjeto(Long projetoId, Long propostaId) {
        Proposta proposta = propostaRepository
                .findById(propostaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposta não encontrada."));
        if (!proposta.getProjeto().getId().equals(projetoId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposta não encontrada neste projeto.");
        }
        return proposta;
    }

    private void garantirLeituraProposta(Proposta proposta, UsuarioAutenticado principal) {
        if (!authz.podeLerProjeto(principal, proposta.getProjeto().getCriadoPor().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a interações desta proposta.");
        }
    }

    private InteracaoFluxoResponse toResponse(InteracaoFluxo i) {
        return new InteracaoFluxoResponse(
                i.getId(),
                i.getTipoInteracao(),
                i.getTexto(),
                i.getRegistradoPor().getId(),
                i.getRegistradoPor().getNome(),
                i.getDocumento() != null ? i.getDocumento().getId() : null,
                i.getCriadoEm());
    }

    private static PropostaResponse toPropostaResponse(Proposta p) {
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
                p.getCobrancaPropostaInicioEm(),
                p.getCriadoEm(),
                p.getAtualizadoEm());
    }

    private static ResponseStatusException badRequest(String msg) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }

    private static ContratoResponse toContratoResponse(Contrato c) {
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

    public record RegistroInteracaoResult(InteracaoFluxoResponse interacao, PropostaResponse proposta) {}

    public record RegistroInteracaoContratoResult(InteracaoFluxoResponse interacao, ContratoResponse contrato) {}
}
