package br.com.catec.domain.auditoria;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditoriaFluxoRepository extends JpaRepository<AuditoriaFluxo, Long> {

    List<AuditoriaFluxo> findByTipoEntidadeAndEntidadeIdOrderByCriadoEmDesc(
            TipoEntidadeAuditoria tipoEntidade, Long entidadeId);
}
