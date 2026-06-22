package br.com.catec.domain.usuario;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    @EntityGraph(attributePaths = {"grupos", "grupos.grupo", "grupos.grupo.permissoes"})
    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    @EntityGraph(attributePaths = {"grupos", "grupos.grupo", "grupos.grupo.permissoes"})
    @Override
    List<Usuario> findAll(Sort sort);

    @EntityGraph(attributePaths = {"grupos", "grupos.grupo", "grupos.grupo.permissoes"})
    @Override
    Optional<Usuario> findById(Long id);
}
