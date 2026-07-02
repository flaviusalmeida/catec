package br.com.catec.domain.proposta;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PropostaRepository extends JpaRepository<Proposta, Long> {

    @Query("SELECT COALESCE(MAX(p.versao), 0) FROM Proposta p WHERE p.projeto.id = :projetoId")
    int findMaxVersaoByProjetoId(@Param("projetoId") Long projetoId);

    @EntityGraph(attributePaths = {"projeto", "projeto.criadoPor", "projeto.cliente", "elaboradoPor", "avaliadaPorSocio"})
    @Override
    Optional<Proposta> findById(Long id);

    @EntityGraph(attributePaths = {"projeto", "projeto.criadoPor", "elaboradoPor"})
    List<Proposta> findByProjetoIdOrderByVersaoDesc(Long projetoId);

    boolean existsByProjetoIdAndStatusIn(Long projetoId, Iterable<PropostaStatus> statuses);

    boolean existsByProjetoIdAndStatus(Long projetoId, PropostaStatus status);

    boolean existsByProjetoIdAndConsideracoesPendentesTrue(Long projetoId);

    @EntityGraph(attributePaths = {"projeto", "projeto.cliente", "elaboradoPor"})
    List<Proposta> findByStatusOrderByCriadoEmAsc(PropostaStatus status);

    @EntityGraph(attributePaths = {"projeto", "projeto.criadoPor", "elaboradoPor"})
    Optional<Proposta> findFirstByProjetoIdAndStatusInOrderByVersaoDesc(
            Long projetoId, Collection<PropostaStatus> statuses);

    @EntityGraph(attributePaths = {"projeto", "projeto.criadoPor"})
    Optional<Proposta> findFirstByProjetoIdOrderByVersaoDesc(Long projetoId);

    @EntityGraph(attributePaths = {"projeto"})
    @Query(
            """
            SELECT pr FROM Proposta pr
            WHERE pr.projeto.id IN :projetoIds
            AND pr.versao = (
                SELECT MAX(pr2.versao) FROM Proposta pr2 WHERE pr2.projeto.id = pr.projeto.id
            )
            """)
    List<Proposta> findMaisRecentesPorProjetoIds(@Param("projetoIds") Collection<Long> projetoIds);

    @Query(
            """
            SELECT COUNT(pr) FROM Proposta pr
            WHERE pr.status IN :statuses
            AND (:criadoPorId IS NULL OR pr.projeto.criadoPor.id = :criadoPorId)
            """)
    long countByStatusInAndProjetoCriadoPor(
            @Param("statuses") Collection<PropostaStatus> statuses, @Param("criadoPorId") Long criadoPorId);

    @Query(
            """
            SELECT COUNT(pr) FROM Proposta pr
            WHERE pr.status = :status
            AND (:criadoPorId IS NULL OR pr.projeto.criadoPor.id = :criadoPorId)
            """)
    long countAguardandoSocio(
            @Param("status") PropostaStatus status, @Param("criadoPorId") Long criadoPorId);

    @Query(
            """
            SELECT COUNT(pr) FROM Proposta pr
            WHERE pr.status = :status
            AND pr.avaliadaSocioEm IS NOT NULL
            AND (:criadoPorId IS NULL OR pr.projeto.criadoPor.id = :criadoPorId)
            """)
    long countAguardandoEnvio(@Param("status") PropostaStatus status, @Param("criadoPorId") Long criadoPorId);

    @Query(
            """
            SELECT COUNT(pr) FROM Proposta pr
            WHERE pr.status = :status
            AND pr.avaliadaSocioEm IS NULL
            AND (:criadoPorId IS NULL OR pr.projeto.criadoPor.id = :criadoPorId)
            """)
    long countEmRascunho(@Param("status") PropostaStatus status, @Param("criadoPorId") Long criadoPorId);
}
