package br.com.catec.api.v1;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Sistema", description = "Endpoints públicos da API v1")
@RestController
@RequestMapping("/api/v1")
public class V1PublicController {

    @Operation(summary = "Health check da API")
    @SecurityRequirements
    @GetMapping("/health-check")
    public Map<String, String> healthCheck() {
        return Map.of("status", "ok", "api", "v1");
    }
}
