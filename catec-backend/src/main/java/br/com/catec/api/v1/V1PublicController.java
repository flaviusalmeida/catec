package br.com.catec.api.v1;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class V1PublicController {

    @GetMapping("/health-check")
    public Map<String, String> healthCheck() {
        return Map.of("status", "ok", "api", "v1");
    }
}
