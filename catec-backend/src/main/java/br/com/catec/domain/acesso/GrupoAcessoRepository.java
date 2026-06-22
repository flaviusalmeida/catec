package br.com.catec.domain.acesso;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GrupoAcessoRepository extends JpaRepository<GrupoAcesso, Long> {

    @EntityGraph(attributePaths = "permissoes")
    List<GrupoAcesso> findAllByOrderByNomeAsc();

    @EntityGraph(attributePaths = "permissoes")
    Optional<GrupoAcesso> findById(Long id);

    @EntityGraph(attributePaths = "permissoes")
    Optional<GrupoAcesso> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    boolean existsByCodigoAndIdNot(String codigo, Long id);
}
