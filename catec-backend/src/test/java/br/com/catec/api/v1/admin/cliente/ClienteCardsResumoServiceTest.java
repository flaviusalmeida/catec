package br.com.catec.api.v1.admin.cliente;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import br.com.catec.domain.cliente.ClienteRepository;
import br.com.catec.domain.cliente.TipoPessoa;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ClienteCardsResumoServiceTest {

    @Mock
    private ClienteRepository clienteRepository;

    @InjectMocks
    private ClienteCardsResumoService service;

    @Test
    void resumo_deveRetornarQuatroCardsComVariacao() {
        when(clienteRepository.count()).thenReturn(10L);
        when(clienteRepository.countByTipoPessoa(TipoPessoa.PF)).thenReturn(6L);
        when(clienteRepository.countByTipoPessoa(TipoPessoa.PJ)).thenReturn(4L);
        when(clienteRepository.countComResponsavel()).thenReturn(8L);

        when(clienteRepository.countByCriadoEmGreaterThanEqualAndCriadoEmLessThan(any(Instant.class), any(Instant.class)))
                .thenReturn(2L);
        when(clienteRepository.countByTipoPessoaAndCriadoEmGreaterThanEqualAndCriadoEmLessThan(
                        org.mockito.ArgumentMatchers.eq(TipoPessoa.PF), any(Instant.class), any(Instant.class)))
                .thenReturn(1L);
        when(clienteRepository.countByTipoPessoaAndCriadoEmGreaterThanEqualAndCriadoEmLessThan(
                        org.mockito.ArgumentMatchers.eq(TipoPessoa.PJ), any(Instant.class), any(Instant.class)))
                .thenReturn(1L);
        when(clienteRepository.countEntradasComResponsavelNoPeriodo(any(Instant.class), any(Instant.class)))
                .thenReturn(3L);

        ClienteCardsResumoResponse out = service.resumo();

        assertEquals("TRIMESTRE", out.periodoTipo());
        assertEquals(4, out.cards().size());

        ClienteResumoCardResponse total = out.cards().get(0);
        assertEquals(ClienteResumoCardTipo.TOTAL, total.tipo());
        assertEquals(10, total.total());
        assertEquals(8, total.totalInicioTrimestre());
        assertEquals(25.0, total.variacaoPercentual());
    }
}
