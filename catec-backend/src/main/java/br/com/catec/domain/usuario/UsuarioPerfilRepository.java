package br.com.catec.domain.usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioPerfilRepository extends JpaRepository<UsuarioPerfil, Long> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from UsuarioPerfil up where up.usuario.id = :usuarioId")
    void deleteByUsuarioId(@Param("usuarioId") Long usuarioId);
}
