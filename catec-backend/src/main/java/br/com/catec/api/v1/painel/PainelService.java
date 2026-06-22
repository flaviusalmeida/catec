package br.com.catec.api.v1.painel;

import br.com.catec.api.v1.common.PageResponse;
import br.com.catec.domain.cliente.Cliente;
import br.com.catec.domain.painel.FaseMacro;
import br.com.catec.domain.painel.FaseMacroResolver;
import br.com.catec.domain.painel.PainelHistoricoRepository;
import br.com.catec.domain.painel.PainelHistoricoRepository.PainelHistoricoLinha;
import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.domain.proposta.Proposta;
import br.com.catec.domain.proposta.PropostaRepository;
import br.com.catec.domain.proposta.PropostaStatus;
import br.com.catec.security.AuthorizationService;
import br.com.catec.security.UsuarioAutenticado;
import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PainelService {

    private static final EnumSet<PropostaStatus> STATUS_AGUARDANDO_REGISTRO_CLIENTE =
            EnumSet.of(PropostaStatus.ENVIADA_AO_CLIENTE, PropostaStatus.EM_AVALIACAO_CLIENTE);

    private final ProjetoRepository projetoRepository;
    private final PropostaRepository propostaRepository;
    private final FaseMacroResolver faseMacroResolver;
    private final PainelHistoricoRepository painelHistoricoRepository;
    private final AuthorizationService authz;

    public PainelService(
            ProjetoRepository projetoRepository,
            PropostaRepository propostaRepository,
            FaseMacroResolver faseMacroResolver,
            PainelHistoricoRepository painelHistoricoRepository,
            AuthorizationService authz) {
        this.projetoRepository = projetoRepository;
        this.propostaRepository = propostaRepository;
        this.faseMacroResolver = faseMacroResolver;
        this.painelHistoricoRepository = painelHistoricoRepository;
        this.authz = authz;
    }

    @Transactional(readOnly = true)
    public PageResponse<PainelProjetoResumoResponse> resumo(
            UsuarioAutenticado principal,
            Long clienteId,
            FaseMacro status,
            Instant prazoAte,
            int page,
            int size) {
        int safeSize = Math.max(1, Math.min(size, 100));
        int safePage = Math.max(page, 0);
        Sort sort = Sort.by(Sort.Direction.DESC, "atualizadoEm");

        List<Projeto> candidatos = listarCandidatos(principal, clienteId, prazoAte, sort);
        Map<Long, Proposta> propostaPorProjeto = carregarPropostasRecentes(candidatos);

        List<PainelProjetoResumoResponse> linhas = new ArrayList<>(candidatos.size());
        for (Projeto p : candidatos) {
            Proposta pr = propostaPorProjeto.get(p.getId());
            FaseMacro fase = faseMacroResolver.resolver(p, pr);
            if (status != null && fase != status) {
                continue;
            }
            linhas.add(toResumo(p, pr, fase));
        }

        int from = Math.min(safePage * safeSize, linhas.size());
        int to = Math.min(from + safeSize, linhas.size());
        List<PainelProjetoResumoResponse> pagina = linhas.subList(from, to);
        return PageResponse.of(pagina, safePage, safeSize, linhas.size());
    }

    @Transactional(readOnly = true)
    public PainelIndicadoresResponse indicadores(UsuarioAutenticado principal) {
        Long criadoPorFiltro = escopoCriador(principal);

        long pendentesCliente = criadoPorFiltro == null
                ? projetoRepository.countByStatus(ProjetoStatus.PENDENTE_CLIENTE)
                : projetoRepository.countByStatusAndCriadoPorId(ProjetoStatus.PENDENTE_CLIENTE, criadoPorFiltro);

        long aguardandoRegistro =
                propostaRepository.countByStatusInAndProjetoCriadoPor(STATUS_AGUARDANDO_REGISTRO_CLIENTE, criadoPorFiltro);

        long aguardandoSocio = propostaRepository.countAguardandoSocio(
                PropostaStatus.PENDENTE_AVALIACAO_SOCIO, criadoPorFiltro);

        long aguardandoEnvio = propostaRepository.countByStatusInAndProjetoCriadoPor(
                List.of(PropostaStatus.APROVADA_INTERNA), criadoPorFiltro);

        long emRascunho = propostaRepository.countByStatusInAndProjetoCriadoPor(
                List.of(PropostaStatus.RASCUNHO), criadoPorFiltro);

        return new PainelIndicadoresResponse(
                pendentesCliente, aguardandoRegistro, aguardandoSocio, aguardandoEnvio, emRascunho);
    }

    @Transactional(readOnly = true)
    public PageResponse<PainelHistoricoItemResponse> historico(
            UsuarioAutenticado principal, Long projetoId, int page, int size) {
        Projeto projeto = projetoRepository
                .findById(projetoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projeto não encontrado."));
        garantirLeitura(projeto, principal);

        int safeSize = Math.max(1, Math.min(size, 100));
        int safePage = Math.max(page, 0);
        int offset = safePage * safeSize;

        List<Long> propostaIds = propostaRepository.findByProjetoIdOrderByVersaoDesc(projetoId).stream()
                .map(Proposta::getId)
                .toList();

        long total = painelHistoricoRepository.contarHistoricoProjeto(projetoId, propostaIds);
        List<PainelHistoricoLinha> linhas =
                painelHistoricoRepository.listarHistoricoProjeto(projetoId, propostaIds, offset, safeSize);

        List<PainelHistoricoItemResponse> content = linhas.stream().map(this::toHistorico).toList();
        return PageResponse.of(content, safePage, safeSize, total);
    }

    private List<Projeto> listarCandidatos(
            UsuarioAutenticado principal, Long clienteId, Instant prazoAte, Sort sort) {
        Specification<Projeto> spec = Specification.where(null);
        if (clienteId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("cliente").get("id"), clienteId));
        }
        if (prazoAte != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("atualizadoEm"), prazoAte));
        }
        Long criadoPor = escopoCriador(principal);
        if (criadoPor != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("criadoPor").get("id"), criadoPor));
        }

        return projetoRepository.findAll(spec, sort);
    }

    private Map<Long, Proposta> carregarPropostasRecentes(List<Projeto> projetos) {
        if (projetos.isEmpty()) {
            return Map.of();
        }
        List<Long> ids = projetos.stream().map(Projeto::getId).toList();
        return propostaRepository.findMaisRecentesPorProjetoIds(ids).stream()
                .collect(Collectors.toMap(p -> p.getProjeto().getId(), Function.identity(), (a, b) -> a));
    }

    private PainelProjetoResumoResponse toResumo(Projeto p, Proposta pr, FaseMacro fase) {
        Cliente c = p.getCliente();
        Instant prazoRef = pr != null && pr.getCobrancaPropostaInicioEm() != null
                ? pr.getCobrancaPropostaInicioEm()
                : p.getAtualizadoEm();
        return new PainelProjetoResumoResponse(
                p.getId(),
                p.getTitulo(),
                c != null ? c.getId() : null,
                c != null ? c.getRazaoSocialOuNome() : null,
                p.getStatus(),
                fase,
                pr != null ? pr.getId() : null,
                pr != null ? pr.getVersao() : null,
                pr != null ? pr.getStatus() : null,
                p.getAtualizadoEm(),
                prazoRef);
    }

    private PainelHistoricoItemResponse toHistorico(PainelHistoricoLinha linha) {
        return new PainelHistoricoItemResponse(
                linha.origem(),
                linha.registroId(),
                linha.tipoEntidade(),
                linha.entidadeId(),
                linha.acao(),
                linha.statusAnterior(),
                linha.statusNovo(),
                linha.tipoInteracao(),
                linha.texto(),
                linha.documentoId(),
                linha.usuarioId(),
                linha.usuarioNome(),
                linha.ocorridoEm());
    }

    private Long escopoCriador(UsuarioAutenticado principal) {
        if (authz.podeListarTodosProjetos(principal)) {
            return null;
        }
        return principal.id();
    }

    private void garantirLeitura(Projeto p, UsuarioAutenticado principal) {
        if (!authz.podeLerProjeto(principal, p.getCriadoPor().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a este projeto.");
        }
    }
}
