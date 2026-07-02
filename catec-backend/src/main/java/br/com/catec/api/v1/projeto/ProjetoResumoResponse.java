package br.com.catec.api.v1.projeto;

import java.util.List;

public record ProjetoResumoResponse(int periodoDias, List<ProjetoResumoCardResponse> cards) {}
