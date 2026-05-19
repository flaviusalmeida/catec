package br.com.catec.domain.documento;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    @Query(
            """
            SELECT COALESCE(MAX(d.versao), 0) FROM Documento d
            WHERE d.tipoVinculo = :tipoVinculo AND d.vinculoId = :vinculoId
            """)
    int findMaxVersao(@Param("tipoVinculo") TipoVinculoDocumento tipoVinculo, @Param("vinculoId") Long vinculoId);

    Optional<Documento> findByChaveStorage(String chaveStorage);

    List<Documento> findByTipoVinculoAndVinculoIdOrderByVersaoDesc(
            TipoVinculoDocumento tipoVinculo, Long vinculoId);
}
