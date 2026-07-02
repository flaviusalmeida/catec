package br.com.catec.api.v1.admin.cliente;

import java.util.List;

public record ClienteCardsResumoResponse(String periodoTipo, String periodoRotulo, List<ClienteResumoCardResponse> cards) {}
