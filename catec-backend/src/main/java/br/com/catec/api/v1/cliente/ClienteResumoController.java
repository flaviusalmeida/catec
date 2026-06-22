package br.com.catec.api.v1.cliente;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Clientes", description = "Listagem resumida para vínculo em projetos")
@RestController
@RequestMapping("/api/v1/clientes-resumo")
@PreAuthorize("@authz.hasAny('acao.projeto.associar_cliente','acao.cliente.criar')")
public class ClienteResumoController {

    private final ClienteResumoService clienteResumoService;

    public ClienteResumoController(ClienteResumoService clienteResumoService) {
        this.clienteResumoService = clienteResumoService;
    }

    @Operation(
            summary = "Autocomplete de clientes",
            description =
                    "Lista clientes para vínculo em projetos. Sem `q`: primeiros por nome; com `q`: filtra por nome (contém) ou documento (só dígitos, mín. 3).")
    @GetMapping
    public List<ClienteResumoResponse> listar(@RequestParam(name = "q", required = false) String q) {
        return clienteResumoService.listar(q);
    }
}
