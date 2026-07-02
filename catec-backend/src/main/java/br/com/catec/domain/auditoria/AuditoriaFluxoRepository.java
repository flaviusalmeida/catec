package br.com.catec.domain.auditoria;

import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditoriaFluxoRepository extends JpaRepository<AuditoriaFluxo, Long> {

    List<AuditoriaFluxo> findByTipoEntidadeAndEntidadeIdOrderByCriadoEmDesc(
            TipoEntidadeAuditoria tipoEntidade, Long entidadeId);

    @Query(
            """
            SELECT COUNT(DISTINCT a.entidadeId)
            FROM AuditoriaFluxo a
            WHERE a.tipoEntidade = :tipoEntidade
              AND a.statusNovo = :status
              AND a.criadoEm >= :inicio
              AND a.criadoEm < :fim
            """)
    long countDistinctEntradasPorStatus(
            @Param("tipoEntidade") TipoEntidadeAuditoria tipoEntidade,
            @Param("status") String status,
            @Param("inicio") Instant inicio,
            @Param("fim") Instant fim);

    @Query(
            """
            SELECT COUNT(DISTINCT a.entidadeId)
            FROM AuditoriaFluxo a, br.com.catec.domain.projeto.Projeto p
            WHERE a.tipoEntidade = :tipoEntidade
              AND a.entidadeId = p.id
              AND a.statusNovo = :status
              AND a.criadoEm >= :inicio
              AND a.criadoEm < :fim
              AND p.criadoPor.id = :criadoPorId
            """)
    long countDistinctEntradasPorStatusAndCriadoPorId(
            @Param("tipoEntidade") TipoEntidadeAuditoria tipoEntidade,
            @Param("status") String status,
            @Param("inicio") Instant inicio,
            @Param("fim") Instant fim,
            @Param("criadoPorId") Long criadoPorId);

    @Query(
            """
            SELECT COUNT(DISTINCT a.entidadeId)
            FROM AuditoriaFluxo a
            WHERE a.tipoEntidade = :tipoEntidade
              AND a.statusAnterior = :status
              AND a.statusNovo IS NOT NULL
              AND a.statusNovo <> :status
              AND a.criadoEm >= :inicio
              AND a.criadoEm < :fim
            """)
    long countDistinctSaidasPorStatus(
            @Param("tipoEntidade") TipoEntidadeAuditoria tipoEntidade,
            @Param("status") String status,
            @Param("inicio") Instant inicio,
            @Param("fim") Instant fim);

    @Query(
            """
            SELECT COUNT(DISTINCT a.entidadeId)
            FROM AuditoriaFluxo a, br.com.catec.domain.projeto.Projeto p
            WHERE a.tipoEntidade = :tipoEntidade
              AND a.entidadeId = p.id
              AND a.statusAnterior = :status
              AND a.statusNovo IS NOT NULL
              AND a.statusNovo <> :status
              AND a.criadoEm >= :inicio
              AND a.criadoEm < :fim
              AND p.criadoPor.id = :criadoPorId
            """)
    long countDistinctSaidasPorStatusAndCriadoPorId(
            @Param("tipoEntidade") TipoEntidadeAuditoria tipoEntidade,
            @Param("status") String status,
            @Param("inicio") Instant inicio,
            @Param("fim") Instant fim,
            @Param("criadoPorId") Long criadoPorId);
}
