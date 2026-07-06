package br.com.catec.api.v1.projeto;

import java.util.List;

public record ProjetoPainelResponse(
        ProjetoPainelTotaisResponse totais,
        List<ProjetoPainelItemResponse> projetosPrazoProximo,
        List<ProjetoPainelItemResponse> projetos) {}
