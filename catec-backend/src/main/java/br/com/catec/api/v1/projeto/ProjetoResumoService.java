package br.com.catec.api.v1.projeto;

import br.com.catec.domain.auditoria.AuditoriaFluxoRepository;
import br.com.catec.domain.auditoria.TipoEntidadeAuditoria;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.security.AuthorizationService;
import br.com.catec.security.UsuarioAutenticado;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjetoResumoService {

    static final int PERIODO_DIAS = 30;

    private static final ProjetoStatus[] CARD_STATUSES = {
        ProjetoStatus.ELABORANDO_PROPOSTA,
        ProjetoStatus.AGUARDANDO_ACEITE_PROPOSTA,
        ProjetoStatus.AGUARDANDO_EXECUCAO,
        ProjetoStatus.EM_EXECUCAO
    };

    private final ProjetoRepository projetoRepository;
    private final AuditoriaFluxoRepository auditoriaFluxoRepository;
    private final AuthorizationService authz;

    public ProjetoResumoService(
            ProjetoRepository projetoRepository,
            AuditoriaFluxoRepository auditoriaFluxoRepository,
            AuthorizationService authz) {
        this.projetoRepository = projetoRepository;
        this.auditoriaFluxoRepository = auditoriaFluxoRepository;
        this.authz = authz;
    }

    @Transactional(readOnly = true)
    public ProjetoResumoResponse resumo(UsuarioAutenticado principal) {
        Instant fim = Instant.now();
        Instant inicio = fim.minus(PERIODO_DIAS, ChronoUnit.DAYS);
        boolean todos = authz.podeListarTodosProjetos(principal);

        List<ProjetoResumoCardResponse> cards =
                Arrays.stream(CARD_STATUSES).map(status -> cardParaStatus(status, principal, inicio, fim, todos)).toList();

        return new ProjetoResumoResponse(PERIODO_DIAS, cards);
    }

    private ProjetoResumoCardResponse cardParaStatus(
            ProjetoStatus status, UsuarioAutenticado principal, Instant inicio, Instant fim, boolean todos) {
        long estoqueAtual = todos
                ? projetoRepository.countByStatus(status)
                : projetoRepository.countByStatusAndCriadoPorId(status, principal.id());

        String statusNome = status.name();
        long entradas = todos
                ? auditoriaFluxoRepository.countDistinctEntradasPorStatus(
                        TipoEntidadeAuditoria.PROJETO, statusNome, inicio, fim)
                : auditoriaFluxoRepository.countDistinctEntradasPorStatusAndCriadoPorId(
                        TipoEntidadeAuditoria.PROJETO, statusNome, inicio, fim, principal.id());

        long saidas = todos
                ? auditoriaFluxoRepository.countDistinctSaidasPorStatus(
                        TipoEntidadeAuditoria.PROJETO, statusNome, inicio, fim)
                : auditoriaFluxoRepository.countDistinctSaidasPorStatusAndCriadoPorId(
                        TipoEntidadeAuditoria.PROJETO, statusNome, inicio, fim, principal.id());

        long estoqueHa30Dias = ProjetoResumoCalculator.calcularEstoqueHa30Dias(estoqueAtual, entradas, saidas);
        double variacao = ProjetoResumoCalculator.calcularVariacaoPercentual(estoqueAtual, estoqueHa30Dias);

        return new ProjetoResumoCardResponse(status, estoqueAtual, estoqueHa30Dias, variacao);
    }
}
