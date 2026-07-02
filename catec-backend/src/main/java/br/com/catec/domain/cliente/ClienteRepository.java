package br.com.catec.domain.cliente;

import java.time.Instant;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    @EntityGraph(attributePaths = "responsaveis")
    Optional<Cliente> findWithResponsaveisById(Long id);

    boolean existsByDocumento(String documento);

    boolean existsByDocumentoAndIdNot(String documento, Long id);

    Page<Cliente> findByRazaoSocialOuNomeContainingIgnoreCase(String fragmento, Pageable pageable);

    Page<Cliente> findByDocumentoContainingIgnoreCase(String fragmento, Pageable pageable);

    long countByTipoPessoa(TipoPessoa tipoPessoa);

    long countByCriadoEmGreaterThanEqualAndCriadoEmLessThan(Instant inicio, Instant fim);

    long countByTipoPessoaAndCriadoEmGreaterThanEqualAndCriadoEmLessThan(
            TipoPessoa tipoPessoa, Instant inicio, Instant fim);

    @Query("SELECT COUNT(c) FROM Cliente c WHERE EXISTS (SELECT 1 FROM ClienteResponsavel r WHERE r.cliente = c)")
    long countComResponsavel();

    @Query(
            """
            SELECT COUNT(c) FROM Cliente c
            WHERE EXISTS (SELECT 1 FROM ClienteResponsavel r WHERE r.cliente = c)
              AND (
                (c.criadoEm >= :inicio AND c.criadoEm < :fim)
                OR (c.criadoEm < :inicio AND c.atualizadoEm >= :inicio AND c.atualizadoEm < :fim)
              )
            """)
    long countEntradasComResponsavelNoPeriodo(@Param("inicio") Instant inicio, @Param("fim") Instant fim);
}
