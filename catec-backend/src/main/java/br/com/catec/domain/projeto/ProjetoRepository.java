package br.com.catec.domain.projeto;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjetoRepository extends JpaRepository<Projeto, Long> {

    @EntityGraph(attributePaths = {"cliente", "criadoPor"})
    List<Projeto> findAllByCriadoPorId(Long criadoPorId, Sort sort);

    @EntityGraph(attributePaths = {"cliente", "criadoPor"})
    @Override
    List<Projeto> findAll(Sort sort);

    @EntityGraph(attributePaths = {"cliente", "criadoPor"})
    @Override
    Optional<Projeto> findById(Long id);
}
