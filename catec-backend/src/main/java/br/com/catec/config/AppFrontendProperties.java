package br.com.catec.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.frontend")
public record AppFrontendProperties(String url) {

    public AppFrontendProperties {
        url = url == null || url.isBlank() ? "http://localhost:3000" : url.replaceAll("/+$", "");
    }

    public String loginUrl() {
        return url + "/catec/login";
    }
}
