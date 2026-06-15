package br.com.catec.api.v1.demo;

import java.util.Map;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Sistema", description = "Exemplo de rota protegida por JWT")
@RestController
@RequestMapping("/api/v1/demo")
public class DemoPingController {

    @Operation(summary = "Ping protegido", description = "Exemplo de endpoint que exige JWT válido.")
    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("ok", "true");
    }
}
