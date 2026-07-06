package br.com.catec.api.v1.contrato;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record EnviarContratoClienteRequest(
        @NotNull(message = "Informe o prazo para conclusão do projeto em dias.")
                @Min(value = 1, message = "O prazo para conclusão do projeto deve ser de pelo menos 1 dia.")
                Integer prazoConclusaoDias) {}
