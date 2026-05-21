package br.com.catec.domain.contrato;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContratoRepository extends JpaRepository<Contrato, Long> {

    Optional<Contrato> findByProjetoId(Long projetoId);

    boolean existsByProjetoId(Long projetoId);
}
