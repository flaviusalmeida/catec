package br.com.catec.api.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        int status,
        @JsonProperty("mensagem") String mensagem,
        Instant timestamp,
        String path) {

    public static ApiError of(int status, String mensagem, String path) {
        return new ApiError(status, mensagem, Instant.now(), path);
    }
}
