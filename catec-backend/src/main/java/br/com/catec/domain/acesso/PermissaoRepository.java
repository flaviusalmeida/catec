package br.com.catec.domain.acesso;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissaoRepository extends JpaRepository<Permissao, Long> {

    List<Permissao> findAllByOrderByModuloAscTipoAscNomeAsc();

    List<Permissao> findByCodigoIn(List<String> codigos);

    Optional<Permissao> findByCodigo(String codigo);
}
