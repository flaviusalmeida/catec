package br.com.catec.domain.cliente;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    @EntityGraph(attributePaths = "responsaveis")
    Optional<Cliente> findWithResponsaveisById(Long id);

    boolean existsByDocumento(String documento);

    boolean existsByDocumentoAndIdNot(String documento, Long id);

    Page<Cliente> findByRazaoSocialOuNomeContainingIgnoreCase(String fragmento, Pageable pageable);

    Page<Cliente> findByDocumentoContainingIgnoreCase(String fragmento, Pageable pageable);
}
