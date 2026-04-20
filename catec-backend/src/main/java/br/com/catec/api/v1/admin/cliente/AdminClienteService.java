package br.com.catec.api.v1.admin.cliente;

import br.com.catec.domain.cliente.Cliente;
import br.com.catec.domain.cliente.ClienteRepository;
import br.com.catec.domain.cliente.TipoPessoa;
import br.com.catec.util.CpfCnpjValidator;
import java.time.Instant;
import java.util.Locale;
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
        String documentoDigitos = normalizarDocumento(req);
        String telefoneDigitos = normalizarTelefone(req.telefone());
        validarDocumentoUnico(null, documentoDigitos);
        Instant agora = Instant.now();
        Cliente c = new Cliente();
        aplicarDados(c, req, documentoDigitos, telefoneDigitos, agora);
        c.setCriadoEm(agora);
        return toResponse(clienteRepository.save(c));
    }

    @Transactional
    public ClienteResponse atualizar(Long id, ClienteRequest req) {
        Cliente c = clienteRepository.findById(id).orElseThrow(AdminClienteService::notFound);
        String documentoDigitos = normalizarDocumento(req);
        String telefoneDigitos = normalizarTelefone(req.telefone());
        validarDocumentoUnico(id, documentoDigitos);
        aplicarDados(c, req, documentoDigitos, telefoneDigitos, Instant.now());
        return toResponse(clienteRepository.save(c));
    }

    @Transactional
    public void remover(Long id) {
        Cliente c = clienteRepository.findById(id).orElseThrow(AdminClienteService::notFound);
        clienteRepository.delete(c);
    }

    private void validarDocumentoUnico(Long id, String documentoDigitos) {
        boolean existe = id == null
                ? clienteRepository.existsByDocumento(documentoDigitos)
                : clienteRepository.existsByDocumentoAndIdNot(documentoDigitos, id);
        if (existe) {
            throw conflict("Já existe cliente com este CPF/CNPJ.");
        }
    }

    /** Aceita documento com ou sem máscara; persiste somente dígitos (11 PF / 14 PJ). */
    private static String normalizarDocumento(ClienteRequest req) {
        String digits = apenasDigitos(req.documento());
        if (digits.isEmpty()) {
            throw badRequest("CPF/CNPJ é obrigatório.");
        }
        if (req.tipoPessoa() == TipoPessoa.PF) {
            if (digits.length() != 11) {
                throw badRequest("CPF deve ter 11 dígitos.");
            }
            if (!CpfCnpjValidator.isCpfValid(digits)) {
                throw badRequest("CPF inválido.");
            }
        } else {
            if (digits.length() != 14) {
                throw badRequest("CNPJ deve ter 14 dígitos.");
            }
            if (!CpfCnpjValidator.isCnpjValid(digits)) {
                throw badRequest("CNPJ inválido.");
            }
        }
        return digits;
    }

    /** DDD + número: 10 (fixo) ou 11 (celular com 9 na frente), só dígitos. */
    private static String normalizarTelefone(String raw) {
        String d = apenasDigitos(raw);
        if (d.isEmpty()) {
            throw badRequest("Telefone é obrigatório.");
        }
        if (d.length() < 10 || d.length() > 11) {
            throw badRequest("Telefone inválido. Informe DDD + número com 10 ou 11 dígitos.");
        }
        if (d.charAt(0) == '0') {
            throw badRequest("Telefone inválido.");
        }
        return d;
    }

    private static String apenasDigitos(String value) {
        if (value == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder(value.length());
        for (int i = 0; i < value.length(); i++) {
            char ch = value.charAt(i);
            if (ch >= '0' && ch <= '9') {
                sb.append(ch);
            }
        }
        return sb.toString();
    }

    private void aplicarDados(
            Cliente c, ClienteRequest req, String documentoDigitos, String telefoneDigitos, Instant atualizadoEm) {
        c.setTipoPessoa(req.tipoPessoa());
        c.setRazaoSocialOuNome(req.razaoSocialOuNome().trim());
        c.setNomeFantasia(blankToNull(req.nomeFantasia()));
        c.setDocumento(documentoDigitos);
        c.setEmail(req.email().trim().toLowerCase(Locale.ROOT));
        c.setTelefone(telefoneDigitos);
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

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
