package br.com.catec.domain.interacao;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InteracaoFluxoRepository extends JpaRepository<InteracaoFluxo, Long> {

    @EntityGraph(attributePaths = {"registradoPor", "documento"})
    List<InteracaoFluxo> findByTipoEntidadeAndEntidadeIdOrderByCriadoEmDesc(
            TipoEntidadeInteracao tipoEntidade, Long entidadeId);
}
