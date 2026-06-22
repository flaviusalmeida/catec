package br.com.catec.domain.usuario;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /** Auth: precisa das permissões dos grupos. */
    @EntityGraph(attributePaths = {"grupos", "grupos.grupo", "grupos.grupo.permissoes"})
    Optional<Usuario> findByEmailIgnoreCase(String email);

    /** `/me`: carrega permissões sem afetar listagens admin. */
    @EntityGraph(attributePaths = {"grupos", "grupos.grupo", "grupos.grupo.permissoes"})
    @Query("SELECT u FROM Usuario u WHERE u.id = :id")
    Optional<Usuario> findByIdComPermissoes(@Param("id") Long id);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
}
