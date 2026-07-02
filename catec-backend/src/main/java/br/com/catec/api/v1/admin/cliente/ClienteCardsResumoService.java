package br.com.catec.api.v1.admin.cliente;

import br.com.catec.api.v1.common.ResumoVariacaoCalculator;
import br.com.catec.domain.cliente.ClienteRepository;
import br.com.catec.domain.cliente.TipoPessoa;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.IsoFields;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteCardsResumoService {

    private static final ClienteResumoCardTipo[] CARD_TIPOS = {
        ClienteResumoCardTipo.TOTAL,
        ClienteResumoCardTipo.PF,
        ClienteResumoCardTipo.PJ,
        ClienteResumoCardTipo.COM_RESPONSAVEL
    };

    private final ClienteRepository clienteRepository;

    public ClienteCardsResumoService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Transactional(readOnly = true)
    public ClienteCardsResumoResponse resumo() {
        Instant fim = Instant.now();
        LocalDate hoje = LocalDate.now(ZoneOffset.UTC);
        LocalDate inicioTrimestre =
                LocalDate.of(hoje.getYear(), hoje.getMonth().firstMonthOfQuarter(), 1);
        Instant inicio = inicioTrimestre.atStartOfDay().toInstant(ZoneOffset.UTC);

        String periodoRotulo = "Q" + hoje.get(IsoFields.QUARTER_OF_YEAR) + " " + hoje.getYear();

        List<ClienteResumoCardResponse> cards =
                Arrays.stream(CARD_TIPOS).map(tipo -> cardParaTipo(tipo, inicio, fim)).toList();

        return new ClienteCardsResumoResponse("TRIMESTRE", periodoRotulo, cards);
    }

    private ClienteResumoCardResponse cardParaTipo(ClienteResumoCardTipo tipo, Instant inicio, Instant fim) {
        long estoqueAtual =
                switch (tipo) {
                    case TOTAL -> clienteRepository.count();
                    case PF -> clienteRepository.countByTipoPessoa(TipoPessoa.PF);
                    case PJ -> clienteRepository.countByTipoPessoa(TipoPessoa.PJ);
                    case COM_RESPONSAVEL -> clienteRepository.countComResponsavel();
                };

        long entradas =
                switch (tipo) {
                    case TOTAL -> clienteRepository.countByCriadoEmGreaterThanEqualAndCriadoEmLessThan(inicio, fim);
                    case PF -> clienteRepository.countByTipoPessoaAndCriadoEmGreaterThanEqualAndCriadoEmLessThan(
                            TipoPessoa.PF, inicio, fim);
                    case PJ -> clienteRepository.countByTipoPessoaAndCriadoEmGreaterThanEqualAndCriadoEmLessThan(
                            TipoPessoa.PJ, inicio, fim);
                    case COM_RESPONSAVEL -> clienteRepository.countEntradasComResponsavelNoPeriodo(inicio, fim);
                };

        long saidas = 0;
        long estoqueInicioTrimestre = ResumoVariacaoCalculator.calcularEstoqueAnterior(estoqueAtual, entradas, saidas);
        double variacao = ResumoVariacaoCalculator.calcularVariacaoPercentual(estoqueAtual, estoqueInicioTrimestre);

        return new ClienteResumoCardResponse(tipo, estoqueAtual, estoqueInicioTrimestre, variacao);
    }
}
