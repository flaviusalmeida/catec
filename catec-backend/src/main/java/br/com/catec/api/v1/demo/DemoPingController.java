package br.com.catec.api.v1.demo;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/demo")
public class DemoPingController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("ok", "true");
    }
}
