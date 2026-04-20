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

    private static final String CPF_VALIDO = "52998224725";
    private static final String CNPJ_VALIDO = "11444777000161";

    @Mock
    private ClienteRepository clienteRepository;

    @InjectMocks
    private AdminClienteService service;

    @Test
    void listar_deveRetornarListaMapeada() {
        when(clienteRepository.findAll(any(org.springframework.data.domain.Sort.class)))
                .thenReturn(
                        List.of(cliente(1L, TipoPessoa.PF, "Joao Silva", CPF_VALIDO), cliente(2L, TipoPessoa.PJ, "Empresa X", CNPJ_VALIDO)));

        List<ClienteResponse> result = service.listar();

        assertEquals(2, result.size());
        assertEquals("Joao Silva", result.get(0).razaoSocialOuNome());
        assertEquals(TipoPessoa.PJ, result.get(1).tipoPessoa());
    }

    @Test
    void criar_quandoDocumentoDuplicado_deveLancarConflict() {
        when(clienteRepository.existsByDocumento(CPF_VALIDO)).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.criar(requestBase()));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(clienteRepository, never()).save(any(Cliente.class));
    }

    @Test
    void criar_quandoCpfDigitosVerificadoresInvalidos_deveLancarBadRequest() {
        ClienteRequest req = new ClienteRequest(
                TipoPessoa.PF,
                "A",
                null,
                "52998224724",
                "a@b.com",
                "11988887777",
                null,
                null,
                null,
                null,
                null,
                null,
                null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.criar(req));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(clienteRepository, never()).save(any(Cliente.class));
    }

    @Test
    void criar_quandoTelefoneCurto_deveLancarBadRequest() {
        ClienteRequest req = new ClienteRequest(
                TipoPessoa.PF,
                "A",
                null,
                CPF_VALIDO,
                "a@b.com",
                "1198888",
                null,
                null,
                null,
                null,
                null,
                null,
                null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.criar(req));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(clienteRepository, never()).save(any(Cliente.class));
    }

    @Test
    void criar_quandoPfSem11Digitos_deveLancarBadRequest() {
        ClienteRequest req = new ClienteRequest(
                TipoPessoa.PF,
                "A",
                null,
                "1234567890",
                "a@b.com",
                "11988887777",
                null,
                null,
                null,
                null,
                null,
                null,
                null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.criar(req));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(clienteRepository, never()).save(any(Cliente.class));
    }

    @Test
    void criar_quandoDocumentoComMascara_devePersistirSoDigitos() {
        ClienteRequest req = new ClienteRequest(
                TipoPessoa.PF,
                "Maria",
                null,
                "529.982.247-25",
                "maria@teste.com",
                "11977776666",
                null,
                null,
                null,
                null,
                null,
                null,
                null);
        when(clienteRepository.existsByDocumento(CPF_VALIDO)).thenReturn(false);
        when(clienteRepository.save(any(Cliente.class))).thenAnswer(invocation -> {
            Cliente c = invocation.getArgument(0);
            ReflectionTestUtils.setField(c, "id", 11L);
            return c;
        });

        ClienteResponse response = service.criar(req);

        assertEquals(11L, response.id());
        assertEquals(CPF_VALIDO, response.documento());
    }

    @Test
    void criar_quandoValido_deveSalvarComCamposNormalizados() {
        when(clienteRepository.existsByDocumento(CPF_VALIDO)).thenReturn(false);
        when(clienteRepository.save(any(Cliente.class))).thenAnswer(invocation -> {
            Cliente c = invocation.getArgument(0);
            ReflectionTestUtils.setField(c, "id", 10L);
            return c;
        });

        ClienteResponse response = service.criar(requestBase());

        assertEquals(10L, response.id());
        assertEquals("Joao da Silva", response.razaoSocialOuNome());
        assertEquals("SP", response.enderecoUf());
        assertEquals(CPF_VALIDO, response.documento());
        assertEquals("joao@teste.com", response.email());
        assertEquals("11988887777", response.telefone());
        assertEquals("Rua A", response.enderecoLogradouro());
        assertEquals("100", response.enderecoNumero());
        assertEquals("Apto 2", response.enderecoComplemento());
    }

    @Test
    void atualizar_quandoNaoExiste_deveLancarNotFound() {
        when(clienteRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(99L, requestBase()));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void atualizar_quandoDocumentoConflita_deveLancarConflict() {
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente(1L, TipoPessoa.PF, "A", CPF_VALIDO)));
        when(clienteRepository.existsByDocumentoAndIdNot(CPF_VALIDO, 1L)).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.atualizar(1L, requestBase()));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void atualizar_quandoValido_deveAtualizarCampos() {
        Cliente existente = cliente(1L, TipoPessoa.PF, "Nome Antigo", CPF_VALIDO);
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(clienteRepository.existsByDocumentoAndIdNot(CNPJ_VALIDO, 1L)).thenReturn(false);
        when(clienteRepository.save(any(Cliente.class))).thenAnswer(invocation -> invocation.getArgument(0));
        ClienteRequest req = new ClienteRequest(
                TipoPessoa.PJ,
                " Empresa Nova ",
                "",
                CNPJ_VALIDO,
                " contato@empresa.com ",
                "11999998888",
                null,
                null,
                null,
                null,
                "rj",
                null,
                "");

        ClienteResponse response = service.atualizar(1L, req);

        assertEquals(TipoPessoa.PJ, response.tipoPessoa());
        assertEquals("Empresa Nova", response.razaoSocialOuNome());
        assertNull(response.nomeFantasia());
        assertEquals("RJ", response.enderecoUf());
        assertEquals(CNPJ_VALIDO, response.documento());
        assertEquals("contato@empresa.com", response.email());
        assertEquals("11999998888", response.telefone());
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
                CPF_VALIDO,
                " joao@teste.com ",
                " 11988887777 ",
                " Rua A ",
                " 100 ",
                " Apto 2 ",
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
