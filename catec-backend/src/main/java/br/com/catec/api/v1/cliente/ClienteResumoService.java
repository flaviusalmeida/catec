package br.com.catec.api.v1.cliente;

import br.com.catec.domain.cliente.Cliente;
import br.com.catec.domain.cliente.ClienteRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteResumoService {

    private static final int LIMITE = 40;

    private final ClienteRepository clienteRepository;

    public ClienteResumoService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Transactional(readOnly = true)
    public List<ClienteResumoResponse> listar(String qParam) {
        String raw = qParam == null ? "" : qParam.trim();
        var page = PageRequest.of(0, LIMITE, Sort.by("razaoSocialOuNome").ascending());
        List<Cliente> rows;
        if (raw.isEmpty()) {
            rows = clienteRepository.findAll(page).getContent();
        } else {
            String digitos = apenasDigitos(raw);
            boolean textoSoComDigitosEMascara =
                    digitos.length() >= 3 && raw.matches("^[0-9\\s().-]+$");
            if (textoSoComDigitosEMascara) {
                rows = clienteRepository.findByDocumentoContainingIgnoreCase(digitos, page).getContent();
            } else {
                rows = clienteRepository
                        .findByRazaoSocialOuNomeContainingIgnoreCase(raw, page)
                        .getContent();
            }
        }
        return rows.stream().map(ClienteResumoService::toResumo).toList();
    }

    private static ClienteResumoResponse toResumo(Cliente c) {
        String em = c.getEmail() != null ? c.getEmail().trim().toLowerCase(Locale.ROOT) : null;
        return new ClienteResumoResponse(c.getId(), c.getRazaoSocialOuNome(), em, c.getTelefone());
    }

    private static String apenasDigitos(String value) {
        StringBuilder sb = new StringBuilder(value.length());
        for (int i = 0; i < value.length(); i++) {
            char ch = value.charAt(i);
            if (ch >= '0' && ch <= '9') {
                sb.append(ch);
            }
        }
        return sb.toString();
    }
}
