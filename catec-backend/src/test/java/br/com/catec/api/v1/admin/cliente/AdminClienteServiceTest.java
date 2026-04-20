package br.com.catec.api.v1.admin.cliente;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.catec.domain.cliente.Cliente;
import br.com.catec.domain.cliente.ClienteRepository;
import br.com.catec.domain.cliente.TipoPessoa;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AdminClienteServiceTest {

    @Mock
    private ClienteRepository clienteRepository;

    @InjectMocks
    private AdminClienteService service;

    @Test
    void listar_deveRetornarListaMapeada() {
        when(clienteRepository.findAll(any(org.springframework.data.domain.Sort.class)))
                .thenReturn(List.of(cliente(1L, TipoPessoa.PF, "Joao Silva", "123"), cliente(2L, TipoPessoa.PJ, "Empresa X", "999")));

        List<ClienteResponse> result = service.listar();

        assertEquals(2, result.size());
        assertEquals("Joao Silva", result.get(0).razaoSocialOuNome());
        assertEquals(TipoPessoa.PJ, result.get(1).tipoPessoa());
    }

    @Test
    void criar_quandoDocumentoDuplicado_deveLancarConflict() {
        when(clienteRepository.existsByDocumento("123")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.criar(requestBase()));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(clienteRepository, never()).save(any(Cliente.class));
    }

    @Test
    void criar_quandoValido_deveSalvarComCamposNormalizados() {
        when(clienteRepository.existsByDocumento("123")).thenReturn(false);
        when(clienteRepository.save(any(Cliente.class))).thenAnswer(invocation -> {
            Cliente c = invocation.getArgument(0);
            ReflectionTestUtils.setField(c, "id", 10L);
            return c;
        });

        ClienteResponse response = service.criar(requestBase());

        assertEquals(10L, response.id());
        assertEquals("Joao da Silva", response.razaoSocialOuNome());
        assertEquals("SP", response.enderecoUf());
        assertEquals("123", response.documento());
    }

    @Test
    void atualizar_quandoNaoExiste_deveLancarNotFound() {
        when(clienteRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(99L, requestBase()));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void atualizar_quandoDocumentoConflita_deveLancarConflict() {
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente(1L, TipoPessoa.PF, "A", null)));
        when(clienteRepository.existsByDocumentoAndIdNot("123", 1L)).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(1L, requestBase()));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void atualizar_quandoValido_deveAtualizarCampos() {
        Cliente existente = cliente(1L, TipoPessoa.PF, "Nome Antigo", "123");
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(clienteRepository.existsByDocumentoAndIdNot("999", 1L)).thenReturn(false);
        when(clienteRepository.save(any(Cliente.class))).thenAnswer(invocation -> invocation.getArgument(0));
        ClienteRequest req =
                new ClienteRequest(TipoPessoa.PJ, " Empresa Nova ", "", "999", " contato@empresa.com ", "1199999", null, null, "rj", null, "");

        ClienteResponse response = service.atualizar(1L, req);

        assertEquals(TipoPessoa.PJ, response.tipoPessoa());
        assertEquals("Empresa Nova", response.razaoSocialOuNome());
        assertNull(response.nomeFantasia());
        assertEquals("RJ", response.enderecoUf());
    }

    @Test
    void remover_quandoNaoExiste_deveLancarNotFound() {
        when(clienteRepository.findById(7L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.remover(7L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void remover_quandoExiste_deveExcluir() {
        Cliente c = cliente(7L, TipoPessoa.PF, "Fulano", null);
        when(clienteRepository.findById(7L)).thenReturn(Optional.of(c));

        service.remover(7L);

        verify(clienteRepository).delete(c);
    }

    private static ClienteRequest requestBase() {
        return new ClienteRequest(
                TipoPessoa.PF,
                " Joao da Silva ",
                " Nome fantasia ",
                "123",
                " joao@teste.com ",
                " 11988887777 ",
                " Rua A ",
                " Sao Paulo ",
                "sp",
                " 12345-000 ",
                " Observacao ");
    }

    private static Cliente cliente(Long id, TipoPessoa tipoPessoa, String nome, String documento) {
        Cliente c = new Cliente();
        ReflectionTestUtils.setField(c, "id", id);
        c.setTipoPessoa(tipoPessoa);
        c.setRazaoSocialOuNome(nome);
        c.setDocumento(documento);
        c.setCriadoEm(Instant.now());
        c.setAtualizadoEm(Instant.now());
        return c;
    }
}
