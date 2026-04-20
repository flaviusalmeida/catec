package br.com.catec.api.v1.admin.cliente;

import br.com.catec.domain.cliente.Cliente;
import br.com.catec.domain.cliente.ClienteRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminClienteService {

    private final ClienteRepository clienteRepository;

    public AdminClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Transactional(readOnly = true)
    public List<ClienteResponse> listar() {
        return clienteRepository.findAll(Sort.by("razaoSocialOuNome").ascending()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponse obter(Long id) {
        return clienteRepository.findById(id).map(this::toResponse).orElseThrow(AdminClienteService::notFound);
    }

    @Transactional
    public ClienteResponse criar(ClienteRequest req) {
        validarDocumentoUnico(null, req.documento());
        Instant agora = Instant.now();
        Cliente c = new Cliente();
        aplicarDados(c, req, agora);
        c.setCriadoEm(agora);
        return toResponse(clienteRepository.save(c));
    }

    @Transactional
    public ClienteResponse atualizar(Long id, ClienteRequest req) {
        Cliente c = clienteRepository.findById(id).orElseThrow(AdminClienteService::notFound);
        validarDocumentoUnico(id, req.documento());
        aplicarDados(c, req, Instant.now());
        return toResponse(clienteRepository.save(c));
    }

    @Transactional
    public void remover(Long id) {
        Cliente c = clienteRepository.findById(id).orElseThrow(AdminClienteService::notFound);
        clienteRepository.delete(c);
    }

    private void validarDocumentoUnico(Long id, String documentoBruto) {
        String documento = blankToNull(documentoBruto);
        if (documento == null) {
            return;
        }
        boolean existe =
                id == null ? clienteRepository.existsByDocumento(documento) : clienteRepository.existsByDocumentoAndIdNot(documento, id);
        if (existe) {
            throw conflict("Já existe cliente com este documento.");
        }
    }

    private void aplicarDados(Cliente c, ClienteRequest req, Instant atualizadoEm) {
        c.setTipoPessoa(req.tipoPessoa());
        c.setRazaoSocialOuNome(req.razaoSocialOuNome().trim());
        c.setNomeFantasia(blankToNull(req.nomeFantasia()));
        c.setDocumento(blankToNull(req.documento()));
        c.setEmail(blankToNull(req.email()));
        c.setTelefone(blankToNull(req.telefone()));
        c.setEnderecoLogradouro(blankToNull(req.enderecoLogradouro()));
        c.setEnderecoCidade(blankToNull(req.enderecoCidade()));
        c.setEnderecoUf(upperOrNull(req.enderecoUf()));
        c.setEnderecoCep(blankToNull(req.enderecoCep()));
        c.setObservacoes(blankToNull(req.observacoes()));
        c.setAtualizadoEm(atualizadoEm);
    }

    private ClienteResponse toResponse(Cliente c) {
        return new ClienteResponse(
                c.getId(),
                c.getTipoPessoa(),
                c.getRazaoSocialOuNome(),
                c.getNomeFantasia(),
                c.getDocumento(),
                c.getEmail(),
                c.getTelefone(),
                c.getEnderecoLogradouro(),
                c.getEnderecoCidade(),
                c.getEnderecoUf(),
                c.getEnderecoCep(),
                c.getObservacoes(),
                c.getCriadoEm(),
                c.getAtualizadoEm());
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String upperOrNull(String value) {
        String trimmed = blankToNull(value);
        return trimmed == null ? null : trimmed.toUpperCase();
    }

    private static ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado.");
    }
}
