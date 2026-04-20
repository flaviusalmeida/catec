package br.com.catec.api.v1.cliente;

import br.com.catec.domain.cliente.ClienteRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/clientes-resumo")
@PreAuthorize("hasAnyRole('COLABORADOR','ADMINISTRATIVO')")
public class ClienteResumoController {

    private final ClienteRepository clienteRepository;

    public ClienteResumoController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @GetMapping
    public List<ClienteResumoResponse> listar() {
        return clienteRepository.findAll(Sort.by("razaoSocialOuNome").ascending()).stream()
                .map(c -> new ClienteResumoResponse(c.getId(), c.getRazaoSocialOuNome()))
                .toList();
    }
}
