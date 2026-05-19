package br.com.catec.api.v1.interacao;

import br.com.catec.api.v1.proposta.PropostaResponse;
import br.com.catec.domain.auditoria.AuditoriaService;
import br.com.catec.domain.auditoria.TipoEntidadeAuditoria;
import br.com.catec.domain.documento.Documento;
import br.com.catec.domain.documento.DocumentoRepository;
import br.com.catec.domain.documento.TipoVinculoDocumento;
import br.com.catec.domain.interacao.InteracaoFluxo;
import br.com.catec.domain.interacao.InteracaoFluxoRepository;
import br.com.catec.domain.interacao.TipoEntidadeInteracao;
import br.com.catec.domain.interacao.TipoInteracaoFluxo;
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
import org.springframework.web.server.ResponseStatusException;

@Service
public class InteracaoFluxoService {

    private static final EnumSet<PropostaStatus> STATUS_RESPOSTA_CLIENTE = EnumSet.of(
            PropostaStatus.ENVIADA_AO_CLIENTE,
            PropostaStatus.EM_AVALIACAO_CLIENTE,
            PropostaStatus.AGUARDANDO_AJUSTE_ADM);

    private final InteracaoFluxoRepository interacaoFluxoRepository;
    private final PropostaRepository propostaRepository;
    private final DocumentoRepository documentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public InteracaoFluxoService(
            InteracaoFluxoRepository interacaoFluxoRepository,
            PropostaRepository propostaRepository,
            DocumentoRepository documentoRepository,
            UsuarioRepository usuarioRepository,
            AuditoriaService auditoriaService) {
        this.interacaoFluxoRepository = interacaoFluxoRepository;
        this.propostaRepository = propostaRepository;
        this.documentoRepository = documentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
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
        exigirAdministrativo(principal);
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

        return new RegistroInteracaoResult(toResponse(salvaInteracao), toPropostaResponse(salva));
    }

    private PropostaStatus aplicarTransicaoPorTipo(Proposta proposta, TipoInteracaoFluxo tipo) {
        PropostaStatus atual = proposta.getStatus();
        return switch (tipo) {
            case CONSIDERACOES_CLIENTE -> {
                if (atual != PropostaStatus.ENVIADA_AO_CLIENTE && atual != PropostaStatus.EM_AVALIACAO_CLIENTE) {
                    throw badRequest("Considerações do cliente só podem ser registradas após o envio da proposta.");
                }
                yield PropostaStatus.AGUARDANDO_AJUSTE_ADM;
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
        if (isAdministrativo(principal) || isSocio(principal)) {
            return;
        }
        if (isColaborador(principal)
                && proposta.getProjeto().getCriadoPor().getId().equals(principal.id())) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a interações desta proposta.");
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

    public record RegistroInteracaoResult(InteracaoFluxoResponse interacao, PropostaResponse proposta) {}
}
