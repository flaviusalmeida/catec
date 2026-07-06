package br.com.catec.api.v1.projeto;

import br.com.catec.domain.projeto.Projeto;
import br.com.catec.domain.projeto.ProjetoRepository;
import br.com.catec.domain.projeto.ProjetoStatus;
import br.com.catec.security.AuthorizationService;
import br.com.catec.security.UsuarioAutenticado;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjetoPainelService {

    static final int TOP_PRAZO_PROXIMO = 10;

    private final ProjetoRepository projetoRepository;
    private final AuthorizationService authz;

    public ProjetoPainelService(ProjetoRepository projetoRepository, AuthorizationService authz) {
        this.projetoRepository = projetoRepository;
        this.authz = authz;
    }

    @Transactional(readOnly = true)
    public ProjetoPainelResponse painel(UsuarioAutenticado principal) {
        Sort sort = Sort.by(Sort.Direction.DESC, "criadoEm");
        List<Projeto> projetos =
                authz.podeListarTodosProjetos(principal)
                        ? projetoRepository.findAll(sort)
                        : projetoRepository.findAllByCriadoPorId(principal.id(), sort);

        List<ProjetoPainelItemResponse> itens = projetos.stream().map(this::toItem).toList();
        ProjetoPainelTotaisResponse totais = calcularTotais(projetos);
        List<ProjetoPainelItemResponse> prazoProximo = itens.stream()
                .filter(i -> i.previsaoConclusaoEm() != null && !ProjetoPainelCalculator.statusTerminal(i.status()))
                .sorted(Comparator.comparing(ProjetoPainelItemResponse::previsaoConclusaoEm))
                .limit(TOP_PRAZO_PROXIMO)
                .toList();

        return new ProjetoPainelResponse(totais, prazoProximo, itens);
    }

    private ProjetoPainelTotaisResponse calcularTotais(List<Projeto> projetos) {
        Map<ProjetoStatus, Long> porStatus = new EnumMap<>(ProjetoStatus.class);
        for (ProjetoStatus status : ProjetoStatus.values()) {
            porStatus.put(status, 0L);
        }

        long emAndamento = 0;
        long aguardandoRevisaoSocio = 0;
        long aguardandoRespostaCliente = 0;
        long emExecucao = 0;
        long atrasados = 0;
        long criticos = 0;
        long atencao = 0;
        long semPrevisao = 0;

        for (Projeto projeto : projetos) {
            ProjetoStatus status = projeto.getStatus();
            porStatus.merge(status, 1L, Long::sum);

            if (status != ProjetoStatus.CANCELADO && status != ProjetoStatus.FINALIZADO) {
                emAndamento++;
            }
            if (status == ProjetoStatus.AGUARDANDO_REVISAO_PROPOSTA) {
                aguardandoRevisaoSocio++;
            }
            if (status == ProjetoStatus.AGUARDANDO_ACEITE_PROPOSTA || status == ProjetoStatus.AGUARDANDO_CONTRATO) {
                aguardandoRespostaCliente++;
            }
            if (status == ProjetoStatus.EM_EXECUCAO) {
                emExecucao++;
            }
            if (ProjetoPainelCalculator.contaSemPrevisao(projeto)) {
                semPrevisao++;
            }
            if (ProjetoPainelCalculator.contaAlerta(projeto, AlertaPrazoProjeto.ATRASADO)) {
                atrasados++;
            }
            if (ProjetoPainelCalculator.contaAlerta(projeto, AlertaPrazoProjeto.CRITICO)) {
                criticos++;
            }
            if (ProjetoPainelCalculator.contaAlerta(projeto, AlertaPrazoProjeto.ATENCAO)) {
                atencao++;
            }
        }

        ProjetoPainelAlertasPrazoResponse alertasPrazo =
                new ProjetoPainelAlertasPrazoResponse(atrasados, criticos, atencao, semPrevisao);

        return new ProjetoPainelTotaisResponse(
                emAndamento,
                aguardandoRevisaoSocio,
                aguardandoRespostaCliente,
                emExecucao,
                porStatus,
                alertasPrazo);
    }

    private ProjetoPainelItemResponse toItem(Projeto projeto) {
        return new ProjetoPainelItemResponse(
                projeto.getId(),
                projeto.getTitulo(),
                projeto.getCliente() != null ? projeto.getCliente().getRazaoSocialOuNome() : null,
                projeto.getCriadoPor() != null ? projeto.getCriadoPor().getNome() : null,
                projeto.getStatus(),
                projeto.getPrevisaoConclusaoEm(),
                projeto.getPrazoConclusaoDias(),
                ProjetoPainelCalculator.calcularDiasRestantes(projeto),
                ProjetoPainelCalculator.calcularAlertaPrazo(projeto),
                ProjetoPainelCalculator.calcularPercentualPrazoConsumido(projeto),
                projeto.getAtualizadoEm());
    }
}
