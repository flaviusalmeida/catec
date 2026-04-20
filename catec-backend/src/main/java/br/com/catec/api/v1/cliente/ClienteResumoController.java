package br.com.catec.api.v1.cliente;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/clientes-resumo")
@PreAuthorize("hasAnyRole('COLABORADOR','ADMINISTRATIVO')")
public class ClienteResumoController {

    private final ClienteResumoService clienteResumoService;

    public ClienteResumoController(ClienteResumoService clienteResumoService) {
        this.clienteResumoService = clienteResumoService;
    }

    /**
     * Lista clientes para autocomplete. {@code q} vazio: primeiros registos por nome; caso contrário filtra por nome
     * (contém, sem distinção de maiúsculas) ou por documento quando o texto parecer só dígitos (mín. 3).
     */
    @GetMapping
    public List<ClienteResumoResponse> listar(@RequestParam(name = "q", required = false) String q) {
        return clienteResumoService.listar(q);
    }
}
