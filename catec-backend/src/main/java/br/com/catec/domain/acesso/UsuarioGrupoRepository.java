package br.com.catec.domain.acesso;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioGrupoRepository extends JpaRepository<UsuarioGrupo, Long> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from UsuarioGrupo ug where ug.usuario.id = :usuarioId")
    void deleteByUsuarioId(@Param("usuarioId") Long usuarioId);
}
