package br.com.catec.domain.projeto;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProjetoRepository extends JpaRepository<Projeto, Long>, JpaSpecificationExecutor<Projeto> {

    @EntityGraph(attributePaths = {"cliente", "criadoPor"})
    List<Projeto> findAllByCriadoPorId(Long criadoPorId, Sort sort);

    @EntityGraph(attributePaths = {"cliente", "criadoPor"})
    @Override
    List<Projeto> findAll(Sort sort);

    @EntityGraph(attributePaths = {"cliente", "criadoPor"})
    @Override
    Optional<Projeto> findById(Long id);

    long countByStatusAndCriadoPorId(ProjetoStatus status, Long criadoPorId);

    long countByStatus(ProjetoStatus status);
}
